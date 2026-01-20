"""Scraping module for fetching pricing page content."""
import httpx
from bs4 import BeautifulSoup
from rich.console import Console
from . import config

console = Console()


def fetch_page(url: str) -> str | None:
    """Fetch a pricing page and return cleaned text content."""
    try:
        headers = {
            "User-Agent": config.USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }

        with console.status(f"[bold blue]Fetching {url}...[/]"):
            response = httpx.get(
                url,
                headers=headers,
                timeout=config.REQUEST_TIMEOUT,
                follow_redirects=True
            )
            response.raise_for_status()

        return response.text

    except httpx.TimeoutException:
        console.print(f"[red]Timeout fetching {url}[/]")
        return None
    except httpx.HTTPStatusError as e:
        console.print(f"[red]HTTP error {e.response.status_code} fetching {url}[/]")
        return None
    except Exception as e:
        console.print(f"[red]Error fetching {url}: {e}[/]")
        return None


def clean_html(html: str) -> str:
    """Extract relevant text content from HTML, focusing on pricing info."""
    soup = BeautifulSoup(html, "html.parser")

    # Remove script, style, nav, footer, and other non-content elements
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "iframe", "svg"]):
        tag.decompose()

    # Try to find pricing-specific sections first
    pricing_keywords = ["pricing", "price", "plan", "tier", "cost", "billing", "subscription"]
    pricing_sections = []

    # Look for sections with pricing-related classes or IDs
    for keyword in pricing_keywords:
        sections = soup.find_all(
            ["section", "div", "main", "article"],
            class_=lambda x: x and keyword in x.lower() if x else False
        )
        pricing_sections.extend(sections)

        sections = soup.find_all(
            ["section", "div", "main", "article"],
            id=lambda x: x and keyword in x.lower() if x else False
        )
        pricing_sections.extend(sections)

    # If we found pricing sections, use those; otherwise use the whole body
    if pricing_sections:
        text_parts = []
        for section in pricing_sections:
            text_parts.append(section.get_text(separator="\n", strip=True))
        text = "\n\n".join(text_parts)
    else:
        # Fall back to main content or body
        main = soup.find("main") or soup.find("body")
        text = main.get_text(separator="\n", strip=True) if main else ""

    # Clean up the text
    lines = []
    for line in text.split("\n"):
        line = line.strip()
        if line and len(line) > 2:  # Skip very short lines
            lines.append(line)

    # Remove duplicate consecutive lines
    cleaned_lines = []
    prev_line = None
    for line in lines:
        if line != prev_line:
            cleaned_lines.append(line)
            prev_line = line

    return "\n".join(cleaned_lines)


def scrape_pricing_page(url: str) -> str | None:
    """Scrape a pricing page and return cleaned content."""
    html = fetch_page(url)
    if not html:
        return None

    cleaned = clean_html(html)

    # Truncate if too long (for LLM context limits)
    max_chars = 50000
    if len(cleaned) > max_chars:
        console.print(f"[yellow]Content truncated from {len(cleaned)} to {max_chars} chars[/]")
        cleaned = cleaned[:max_chars]

    return cleaned
