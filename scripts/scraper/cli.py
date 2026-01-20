"""Interactive CLI for the pricing scraper."""
import json
import sys
import time
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.syntax import Syntax
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
from . import config
from .scrape import scrape_pricing_page
from .extract import extract_pricing, validate_extraction
from .discover import discover_all, merge_with_existing, save_discovered, DISCOVERY_SOURCES

console = Console()


def load_services() -> dict:
    """Load services from the URL config file."""
    if not config.SERVICES_URLS_FILE.exists():
        console.print("[red]Error: services_urls.json not found[/]")
        sys.exit(1)

    with open(config.SERVICES_URLS_FILE) as f:
        return json.load(f)


def save_extracted(service_id: str, data: dict):
    """Save extracted data to JSON file."""
    config.EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
    output_file = config.EXTRACTED_DIR / f"{service_id}.json"

    with open(output_file, "w") as f:
        json.dump(data, f, indent=2)

    console.print(f"[green]Saved to {output_file}[/]")


def load_extracted(service_id: str) -> dict | None:
    """Load previously extracted data."""
    output_file = config.EXTRACTED_DIR / f"{service_id}.json"
    if output_file.exists():
        with open(output_file) as f:
            return json.load(f)
    return None


def display_services_list(services: dict, filter_text: str = ""):
    """Display a table of all services."""
    table = Table(title="Available Services")
    table.add_column("#", style="dim", width=4)
    table.add_column("ID", style="cyan")
    table.add_column("Name", style="green")
    table.add_column("Category", style="yellow")
    table.add_column("Extracted", style="magenta", width=10)

    filter_lower = filter_text.lower()
    idx = 1
    for service_id, info in sorted(services.items(), key=lambda x: (x[1]["category"], x[1]["name"])):
        if filter_text and filter_lower not in service_id.lower() and filter_lower not in info["name"].lower():
            continue

        extracted = "Yes" if (config.EXTRACTED_DIR / f"{service_id}.json").exists() else "-"
        table.add_row(
            str(idx),
            service_id,
            info["name"],
            info["category"],
            extracted
        )
        idx += 1

    console.print(table)


def display_extracted_data(data: dict):
    """Display extracted pricing data nicely."""
    console.print()
    console.print(Panel(f"[bold]{data.get('name', 'Unknown')}[/] - {data.get('description', 'No description')}", title="Extracted Data"))

    # Basic info
    console.print(f"[dim]ID:[/] {data.get('id')}")
    console.print(f"[dim]Category:[/] {data.get('category')}")
    console.print(f"[dim]Pricing Model:[/] {data.get('pricingModel')}")

    if data.get('feePercent'):
        console.print(f"[dim]Fee:[/] {data.get('feePercent')}% + ${data.get('perTransaction', 0)}/txn")

    # Tiers table
    if data.get("tiers"):
        console.print()
        tiers_table = Table(title="Pricing Tiers")
        tiers_table.add_column("Tier", style="cyan")
        tiers_table.add_column("Base Cost", style="green", justify="right")
        tiers_table.add_column("Trigger At", style="yellow", justify="right")
        tiers_table.add_column("Fee %", style="magenta", justify="right")

        for tier in data["tiers"]:
            fee = f"{tier.get('feePercent')}%" if tier.get('feePercent') is not None else "-"
            tiers_table.add_row(
                tier.get("name", "Unknown"),
                f"${tier.get('baseCost', 0)}",
                f"{tier.get('triggerAt', 0)} users",
                fee
            )

        console.print(tiers_table)

    # Cost estimates
    if data.get("costPer1kUsers"):
        console.print()
        costs = data["costPer1kUsers"]
        console.print("[dim]Est. cost @ 1K users:[/]")
        console.print(f"  Low: [green]${costs.get('low', 0)}[/]  |  Medium: [yellow]${costs.get('medium', 0)}[/]  |  High: [red]${costs.get('high', 0)}[/]")

    # Gotchas
    if data.get("gotchas"):
        console.print()
        console.print("[dim]Gotchas:[/]")
        for gotcha in data["gotchas"]:
            console.print(f"  [yellow]*[/] {gotcha}")

    # Metadata
    console.print()
    console.print(f"[dim]Source:[/] {data.get('sourceUrl', 'Unknown')}")
    console.print(f"[dim]Scraped:[/] {data.get('scrapedAt', 'Unknown')}")


def scrape_single_service(services: dict):
    """Interactive flow to scrape a single service."""
    display_services_list(services)

    console.print()
    service_id = Prompt.ask("Enter service ID to scrape (or 'back' to return)")

    if service_id.lower() == "back":
        return

    if service_id not in services:
        console.print(f"[red]Service '{service_id}' not found[/]")
        return

    service = services[service_id]
    console.print()
    console.print(f"[bold]Scraping {service['name']}[/] from {service['url']}")

    # Check for existing extraction
    existing = load_extracted(service_id)
    if existing:
        console.print(f"[yellow]Note: Previous extraction exists from {existing.get('scrapedAt', 'unknown')}[/]")
        if not Confirm.ask("Continue with fresh scrape?", default=True):
            display_extracted_data(existing)
            return

    # Scrape the page
    content = scrape_pricing_page(service["url"])
    if not content:
        console.print("[red]Failed to scrape page[/]")
        return

    console.print(f"[green]Scraped {len(content)} characters of content[/]")

    # Extract pricing data
    data = extract_pricing(
        service_id=service_id,
        service_name=service["name"],
        category=service["category"],
        url=service["url"],
        content=content
    )

    if not data:
        console.print("[red]Failed to extract pricing data[/]")
        return

    # Validate
    warnings = validate_extraction(data)
    if warnings:
        console.print()
        console.print("[yellow]Validation warnings:[/]")
        for warning in warnings:
            console.print(f"  [yellow]*[/] {warning}")

    # Display results
    display_extracted_data(data)

    # Ask to save
    console.print()
    if Confirm.ask("Save this extraction?", default=True):
        save_extracted(service_id, data)
    else:
        console.print("[dim]Discarded[/]")


def view_extracted(services: dict):
    """View previously extracted data."""
    extracted_files = list(config.EXTRACTED_DIR.glob("*.json"))

    if not extracted_files:
        console.print("[yellow]No extracted data yet[/]")
        return

    table = Table(title="Extracted Services")
    table.add_column("#", style="dim", width=4)
    table.add_column("Service", style="cyan")
    table.add_column("Scraped At", style="green")

    for idx, f in enumerate(sorted(extracted_files), 1):
        with open(f) as file:
            data = json.load(file)
        table.add_row(
            str(idx),
            data.get("name", f.stem),
            data.get("scrapedAt", "Unknown")[:10]
        )

    console.print(table)
    console.print()

    service_id = Prompt.ask("Enter service ID to view (or 'back' to return)")
    if service_id.lower() == "back":
        return

    data = load_extracted(service_id)
    if data:
        display_extracted_data(data)

        # Option to view raw JSON
        if Confirm.ask("View raw JSON?", default=False):
            console.print()
            syntax = Syntax(json.dumps(data, indent=2), "json", theme="monokai")
            console.print(syntax)
    else:
        console.print(f"[red]No extracted data for '{service_id}'[/]")


def search_services(services: dict):
    """Search for services by name or ID."""
    query = Prompt.ask("Search query")
    display_services_list(services, filter_text=query)


def export_to_typescript():
    """Export all extracted data to TypeScript format for services-data.ts."""
    extracted_files = list(config.EXTRACTED_DIR.glob("*.json"))

    if not extracted_files:
        console.print("[yellow]No extracted data to export[/]")
        return

    services_data = []
    for f in sorted(extracted_files):
        with open(f) as file:
            data = json.load(file)
        services_data.append(data)

    # Clean up service data - ensure required fields are never null
    for service in services_data:
        if "tiers" in service and service["tiers"]:
            for tier in service["tiers"]:
                if tier.get("baseCost") is None:
                    tier["baseCost"] = 0
                if tier.get("triggerAt") is None:
                    tier["triggerAt"] = 0

    # Generate complete TypeScript file with types and helper functions
    ts_header = '''// Comprehensive SaaS Service Pricing Data
// Auto-generated by pricing scraper
// Last updated: ''' + str(__import__("datetime").datetime.now().isoformat()[:10]) + '''

export type ServiceCategory =
  | "database"
  | "hosting"
  | "auth"
  | "email"
  | "payments"
  | "analytics"
  | "storage"
  | "jobs";

export interface TierLimits {
  users?: string | number | null;
  storage?: string | number | null;
  bandwidth?: string | number | null;
  apiCalls?: string | number | null;
  projects?: string | number | null;
  other?: unknown;
  [key: string]: unknown;
}

export interface ServiceTier {
  name: string;
  baseCost: number;
  triggerAt: number;
  includedUnits?: unknown;
  unitType?: string | null;
  overageCost?: unknown;
  feePercent?: number | null;
  features?: string[] | null;
  limits?: TierLimits | null;
  [key: string]: unknown;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description?: string;
  capabilities?: string[] | null;
  bundledCategories?: string[] | null;
  tiers: ServiceTier[];
  pricingModel?: "flat" | "usage" | "percentage" | "per-user" | string;
  feePercent?: number | string | null;
  perTransaction?: number | string | null;
  costPer1kUsers?: {
    low: number;
    medium: number;
    high: number;
  } | null;
  gotchas?: string[] | null;
  alternatives?: string[] | null;
  recommended?: boolean;
  scrapedAt?: string;
  sourceUrl?: string;
}

export interface Category {
  id: ServiceCategory;
  name: string;
  icon: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "database",
    name: "Database",
    icon: "Database",
    description: "PostgreSQL, NoSQL, and serverless databases",
  },
  {
    id: "hosting",
    name: "Hosting",
    icon: "Server",
    description: "Deployment and hosting platforms",
  },
  {
    id: "auth",
    name: "Auth",
    icon: "Shield",
    description: "Authentication and user management",
  },
  {
    id: "email",
    name: "Email",
    icon: "Mail",
    description: "Transactional email services",
  },
  {
    id: "payments",
    name: "Payments",
    icon: "CreditCard",
    description: "Payment processing and subscriptions",
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: "BarChart3",
    description: "Product analytics and error tracking",
  },
  {
    id: "storage",
    name: "Storage",
    icon: "HardDrive",
    description: "File storage and CDN",
  },
  {
    id: "jobs",
    name: "Jobs",
    icon: "Cog",
    description: "Background jobs and queues",
  },
];

'''

    ts_footer = '''

// Helper functions
export function getServicesByCategory(category: ServiceCategory): Service[] {
  return SERVICES.filter((s) => s.category === category);
}

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function getRecommendedServices(): Service[] {
  return SERVICES.filter((s) => s.recommended);
}

export function getCategoryById(id: ServiceCategory): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function calculateServiceCost(service: Service, users: number): number {
  if (!service.tiers || service.tiers.length === 0) return 0;
  const sortedTiers = [...service.tiers].sort(
    (a, b) => b.triggerAt - a.triggerAt
  );
  const activeTier =
    sortedTiers.find((tier) => users >= tier.triggerAt) || service.tiers[0];
  return activeTier.baseCost;
}

export function getServiceUpgrades(
  service: Service,
  currentUsers: number
): { tier: ServiceTier; isActive: boolean }[] {
  if (!service.tiers) return [];
  return service.tiers.map((tier) => ({
    tier,
    isActive: currentUsers >= tier.triggerAt,
  }));
}
'''

    services_json = json.dumps(services_data, indent=2)
    ts_content = ts_header + "export const SERVICES: Service[] = " + services_json + ";" + ts_footer

    # Write to the lib directory directly
    output_file = config.PROJECT_ROOT / "lib" / "services-data.ts"
    with open(output_file, "w") as f:
        f.write(ts_content)

    console.print(f"[green]Written {len(services_data)} services to {output_file}[/]")


def run_discovery():
    """Discover new services using LLM."""
    console.print("\n[bold]Service Discovery[/]")
    console.print("This will use the LLM to find new SaaS tools from various sources.\n")

    for i, source in enumerate(DISCOVERY_SOURCES):
        console.print(f"  [{i+1}] {source['name']}")

    if not Confirm.ask("\nRun discovery? (uses API credits)", default=True):
        return

    discovered = discover_all()

    if not discovered:
        console.print("[red]No services discovered[/]")
        return

    # Show what was found
    table = Table(title=f"Discovered {len(discovered)} Services")
    table.add_column("Name", style="cyan")
    table.add_column("Category", style="yellow")
    table.add_column("URL", style="dim", max_width=40)

    for svc in discovered[:30]:  # Show first 30
        table.add_row(
            svc.get("name", "?"),
            svc.get("category", "?"),
            svc.get("url", "?")[:40]
        )

    if len(discovered) > 30:
        table.add_row("...", f"+{len(discovered)-30} more", "...")

    console.print(table)

    # Merge with existing
    new_services = merge_with_existing(discovered, config.SERVICES_URLS_FILE)
    console.print(f"\n[green]{len(new_services)} NEW services[/] (not already in your list)")

    if new_services and Confirm.ask("Add new services to services_urls.json?", default=True):
        # Load existing and merge
        with open(config.SERVICES_URLS_FILE) as f:
            existing = json.load(f)

        existing.update(new_services)

        with open(config.SERVICES_URLS_FILE, "w") as f:
            json.dump(existing, f, indent=2)

        console.print(f"[green]Added {len(new_services)} new services![/]")

    # Also save raw discovery results
    discovery_file = config.DATA_DIR / "discovered_services.json"
    save_discovered(discovered, str(discovery_file))


def scrape_all_services(services: dict):
    """Batch scrape all services."""
    existing = set(f.stem for f in config.EXTRACTED_DIR.glob("*.json"))
    to_scrape = {k: v for k, v in services.items() if k not in existing}

    console.print(f"\n[bold]Batch Scrape[/]")
    console.print(f"Model: [cyan]{config.MODEL}[/]")
    console.print(f"Already extracted: [green]{len(existing)}[/]")
    console.print(f"Remaining: [yellow]{len(to_scrape)}[/]")

    if not to_scrape:
        console.print("[green]All services already extracted![/]")
        return

    if not Confirm.ask(f"\nScrape {len(to_scrape)} services?", default=True):
        return

    success = 0
    failed = []

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        console=console
    ) as progress:
        task = progress.add_task("Scraping...", total=len(to_scrape))

        for service_id, info in to_scrape.items():
            progress.update(task, description=f"[cyan]{info['name']}[/]")

            try:
                content = scrape_pricing_page(info["url"])
                if not content:
                    failed.append((service_id, "No content"))
                    progress.advance(task)
                    continue

                data = extract_pricing(
                    service_id=service_id,
                    service_name=info["name"],
                    category=info["category"],
                    url=info["url"],
                    content=content
                )

                if data:
                    output_file = config.EXTRACTED_DIR / f"{service_id}.json"
                    with open(output_file, "w") as f:
                        json.dump(data, f, indent=2)
                    success += 1
                else:
                    failed.append((service_id, "Extraction failed"))

            except Exception as e:
                error_msg = str(e)[:50]
                if "429" in error_msg:
                    console.print(f"\n[red]Rate limited! Waiting 60s...[/]")
                    time.sleep(60)
                    failed.append((service_id, "Rate limited"))
                else:
                    failed.append((service_id, error_msg))

            progress.advance(task)
            time.sleep(2)  # Rate limit protection

    console.print(f"\n[bold]Done![/]")
    console.print(f"Success: [green]{success}[/]")
    console.print(f"Failed: [red]{len(failed)}[/]")

    if failed:
        console.print("\n[yellow]Failed services:[/]")
        for service_id, reason in failed:
            console.print(f"  - {service_id}: {reason}")


def main_menu():
    """Main interactive menu."""
    services = load_services()

    while True:
        extracted_count = len(list(config.EXTRACTED_DIR.glob("*.json")))

        console.print()
        console.print(Panel(
            f"[bold]Pricing Scraper CLI[/]\n[dim]Model: {config.MODEL}[/]",
            subtitle=f"{len(services)} services | {extracted_count} extracted"
        ))
        console.print()
        console.print("[bold cyan]--- Scraping ---[/]")
        console.print("[1] Scrape ALL services (batch)")
        console.print("[2] Scrape single service")
        console.print()
        console.print("[bold cyan]--- Discovery ---[/]")
        console.print("[3] Discover NEW services (LLM)")
        console.print()
        console.print("[bold cyan]--- View/Export ---[/]")
        console.print("[4] List all services")
        console.print("[5] View extracted data")
        console.print("[6] Export to TypeScript")
        console.print()
        console.print("[q] Quit")
        console.print()

        choice = Prompt.ask("Choose", choices=["1", "2", "3", "4", "5", "6", "q"], default="1")

        if choice == "1":
            services = load_services()  # Reload in case discovery added new ones
            scrape_all_services(services)
        elif choice == "2":
            scrape_single_service(services)
        elif choice == "3":
            run_discovery()
            services = load_services()  # Reload after discovery
        elif choice == "4":
            display_services_list(services)
        elif choice == "5":
            view_extracted(services)
        elif choice == "6":
            export_to_typescript()
        elif choice == "q":
            console.print("[dim]Goodbye![/]")
            break


def main():
    """Entry point."""
    try:
        main_menu()
    except KeyboardInterrupt:
        console.print("\n[dim]Interrupted[/]")
        sys.exit(0)


if __name__ == "__main__":
    main()
