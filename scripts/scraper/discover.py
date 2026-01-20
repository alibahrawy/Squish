"""Service discovery module - find new SaaS tools people use."""
import json
from openai import OpenAI
from rich.console import Console
from . import config

console = Console()

# Known sources to discover services from
DISCOVERY_SOURCES = [
    {
        "name": "Common Vibe Coding Stacks",
        "prompt": """List 50 SaaS tools and services commonly used by indie hackers and developers building web apps in 2025.
Focus on tools used for: databases, hosting, auth, email, payments, analytics, storage, background jobs, AI/ML APIs,
monitoring, feature flags, CMS, forms, scheduling, notifications, search, and any other common needs.

For EACH tool, provide:
- name: Service name
- url: Pricing page URL (must be real, working URL)
- category: One of [database, hosting, auth, email, payments, analytics, storage, jobs, ai, monitoring, cms, other]
- why: Brief reason why it's popular

Return as JSON array. Only include tools with public pricing pages."""
    },
    {
        "name": "No-Code/Low-Code Stack",
        "prompt": """List 30 no-code and low-code tools used to build web applications in 2025.
Include: website builders, form builders, automation tools, database frontends, app builders.

For EACH tool:
- name: Service name
- url: Pricing page URL
- category: One of [database, hosting, auth, email, payments, analytics, storage, jobs, nocode, automation, other]
- why: Brief reason why it's popular

Return as JSON array."""
    },
    {
        "name": "Developer Infrastructure 2025",
        "prompt": """List 30 developer infrastructure and DevOps tools commonly used in 2025.
Include: CI/CD, logging, error tracking, APM, secrets management, feature flags, testing, etc.

For EACH tool:
- name: Service name
- url: Pricing page URL
- category: One of [hosting, analytics, monitoring, devops, testing, other]
- why: Brief reason why it's popular

Return as JSON array."""
    }
]


def discover_services(source_index: int = 0) -> list[dict] | None:
    """Use LLM to discover services from a knowledge source."""
    if not config.OPENROUTER_API_KEY:
        console.print("[red]Error: OPENROUTER_API_KEY not set[/]")
        return None

    source = DISCOVERY_SOURCES[source_index]

    client = OpenAI(
        base_url=config.OPENROUTER_BASE_URL,
        api_key=config.OPENROUTER_API_KEY,
    )

    try:
        with console.status(f"[bold blue]Discovering services: {source['name']}...[/]"):
            response = client.chat.completions.create(
                model=config.MODEL,
                max_tokens=8000,
                messages=[
                    {"role": "user", "content": source["prompt"]}
                ],
                extra_headers={
                    "HTTP-Referer": "https://github.com/squish-saas",
                    "X-Title": "Squish Service Discovery",
                }
            )

        response_text = response.choices[0].message.content.strip()

        # Clean up response
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])

        services = json.loads(response_text)
        return services

    except json.JSONDecodeError as e:
        console.print(f"[red]Error parsing response: {e}[/]")
        return None
    except Exception as e:
        console.print(f"[red]Error: {e}[/]")
        return None


def discover_all() -> list[dict]:
    """Run all discovery sources and merge results."""
    all_services = []
    seen_names = set()

    for i, source in enumerate(DISCOVERY_SOURCES):
        console.print(f"\n[bold]Source {i+1}/{len(DISCOVERY_SOURCES)}: {source['name']}[/]")

        services = discover_services(i)
        if services:
            for svc in services:
                name_lower = svc.get("name", "").lower()
                if name_lower and name_lower not in seen_names:
                    seen_names.add(name_lower)
                    all_services.append(svc)

            console.print(f"[green]Found {len(services)} services ({len(all_services)} total unique)[/]")

    return all_services


def merge_with_existing(discovered: list[dict], existing_file: str) -> dict:
    """Merge discovered services with existing services_urls.json."""
    # Load existing
    with open(existing_file) as f:
        existing = json.load(f)

    existing_names = {info["name"].lower() for info in existing.values()}

    new_services = {}
    for svc in discovered:
        name = svc.get("name", "")
        name_lower = name.lower()

        if name_lower not in existing_names:
            # Generate ID from name
            service_id = name.lower().replace(" ", "-").replace(".", "-")

            new_services[service_id] = {
                "name": name,
                "url": svc.get("url", ""),
                "category": svc.get("category", "other"),
                "why": svc.get("why", ""),
                "discovered": True
            }

    return new_services


def save_discovered(services: list[dict], output_file: str):
    """Save discovered services to a JSON file."""
    with open(output_file, "w") as f:
        json.dump(services, f, indent=2)
    console.print(f"[green]Saved {len(services)} services to {output_file}[/]")
