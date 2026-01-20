"""LLM extraction module for parsing pricing data."""
import json
from datetime import datetime, timezone
from openai import OpenAI
from rich.console import Console
from . import config

console = Console()

EXTRACTION_PROMPT = """You are a SaaS pricing analyst. Extract comprehensive pricing and feature information from this pricing page.

SERVICE: {service_name}
CATEGORY: {category}
PRICING PAGE URL: {url}

---
PRICING PAGE CONTENT:
{content}
---

Extract into this JSON structure:

{{
  "id": "{service_id}",
  "name": "{service_name}",
  "category": "{category}",
  "description": "Brief 1-sentence description of what this service does",
  "pricingModel": "flat" | "usage" | "percentage" | "per-user",

  "capabilities": ["list", "of", "things", "this", "product", "can", "do"],

  "tiers": [
    {{
      "name": "Tier name (e.g., Free, Pro, Enterprise)",
      "baseCost": 0,
      "triggerAt": 0,
      "includedUnits": null,
      "unitType": null,
      "overageCost": null,
      "feePercent": null,
      "features": [
        "Feature 1 included in this tier",
        "Feature 2 with specific limit (e.g., '10GB storage')",
        "Feature 3"
      ],
      "limits": {{
        "users": null,
        "storage": null,
        "bandwidth": null,
        "apiCalls": null,
        "projects": null,
        "other": null
      }}
    }}
  ],

  "feePercent": null,
  "perTransaction": null,

  "costPer1kUsers": {{
    "low": 0,
    "medium": 0,
    "high": 0
  }},

  "gotchas": [
    "Important pricing notes, limitations, or gotchas"
  ],

  "alternatives": ["competitor1", "competitor2"],

  "recommended": false
}}

RULES:
1. "capabilities" - List ALL things this product can do. E.g., Supabase: ["database", "authentication", "storage", "realtime", "edge-functions"]. Be thorough.

2. "tiers[].features" - List specific features included in each tier. Be specific with numbers/limits when shown.

3. "tiers[].limits" - Extract concrete limits like:
   - users: "50,000 MAU" or "unlimited"
   - storage: "500MB" or "8GB"
   - bandwidth: "5GB" or "250GB"
   - apiCalls: "500K/month"
   - projects: "2 projects"

4. "triggerAt" - User count where this tier becomes necessary (0 for free/starter)

5. "pricingModel":
   - "flat": Fixed monthly price
   - "usage": Pay-as-you-go
   - "percentage": Transaction-based (Stripe's 2.9% + $0.30)
   - "per-user": Scales with MAU

6. "costPer1kUsers" - ESTIMATE monthly cost for 1,000 active users:
   - low: Light usage
   - medium: Typical usage
   - high: Heavy usage

7. "alternatives" - List 2-4 direct competitors/alternatives if you know them

8. "gotchas" - Include:
   - Free tier limitations
   - Hidden costs or overages
   - Restrictions that might surprise customers
   - Anything that makes pricing confusing

9. Sort tiers by baseCost ascending

Return ONLY valid JSON, no markdown code blocks."""


def extract_pricing(
    service_id: str,
    service_name: str,
    category: str,
    url: str,
    content: str
) -> dict | None:
    """Use OpenRouter (free) to extract structured pricing data from page content."""
    if not config.OPENROUTER_API_KEY:
        console.print("[red]Error: OPENROUTER_API_KEY not set in .env file[/]")
        console.print("[dim]Get a free key at https://openrouter.ai/keys[/]")
        console.print("[dim]Create scripts/.env with: OPENROUTER_API_KEY=your_key_here[/]")
        return None

    client = OpenAI(
        base_url=config.OPENROUTER_BASE_URL,
        api_key=config.OPENROUTER_API_KEY,
    )

    prompt = EXTRACTION_PROMPT.format(
        service_id=service_id,
        service_name=service_name,
        category=category,
        url=url,
        content=content
    )

    try:
        with console.status(f"[bold blue]Extracting pricing data with {config.MODEL}...[/]"):
            response = client.chat.completions.create(
                model=config.MODEL,
                max_tokens=config.MAX_TOKENS,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                extra_headers={
                    "HTTP-Referer": "https://github.com/squish-saas",
                    "X-Title": "Squish Pricing Scraper",
                }
            )

        # Get the response text
        response_text = response.choices[0].message.content.strip()

        # Try to parse as JSON
        # Handle case where Claude wraps in markdown code blocks
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            # Remove first and last lines (```json and ```)
            response_text = "\n".join(lines[1:-1])

        data = json.loads(response_text)

        # Add metadata
        data["scrapedAt"] = datetime.now(timezone.utc).isoformat()
        data["sourceUrl"] = url

        return data

    except json.JSONDecodeError as e:
        console.print(f"[red]Error parsing JSON response: {e}[/]")
        console.print("[dim]Raw response:[/]")
        console.print(response_text[:500] if 'response_text' in dir() else "No response")
        return None
    except Exception as e:
        console.print(f"[red]Error calling Claude API: {e}[/]")
        return None


def validate_extraction(data: dict) -> list[str]:
    """Validate extracted data and return list of warnings."""
    warnings = []

    required_fields = ["id", "name", "category", "description", "pricingModel", "tiers"]
    for field in required_fields:
        if field not in data or data[field] is None:
            warnings.append(f"Missing required field: {field}")

    if "tiers" in data:
        if not isinstance(data["tiers"], list):
            warnings.append("tiers should be a list")
        elif len(data["tiers"]) == 0:
            warnings.append("No pricing tiers found")
        else:
            for i, tier in enumerate(data["tiers"]):
                if "name" not in tier:
                    warnings.append(f"Tier {i} missing name")
                if "baseCost" not in tier:
                    warnings.append(f"Tier {i} missing baseCost")
                if not tier.get("features"):
                    warnings.append(f"Tier {i} ({tier.get('name', '?')}) missing features list")

    if data.get("pricingModel") == "percentage":
        if not data.get("feePercent"):
            warnings.append("Percentage pricing model but no feePercent set")

    if not data.get("capabilities"):
        warnings.append("Missing capabilities list (what this product can do)")

    return warnings
