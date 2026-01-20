"""Configuration for the pricing scraper."""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from scripts directory
load_dotenv(Path(__file__).parent.parent / ".env")

# OpenRouter API key (free at openrouter.ai)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

# Paths
SCRIPTS_DIR = Path(__file__).parent.parent
PROJECT_ROOT = SCRIPTS_DIR.parent  # The main project directory
DATA_DIR = SCRIPTS_DIR / "data"
SERVICES_URLS_FILE = DATA_DIR / "services_urls.json"
EXTRACTED_DIR = DATA_DIR / "extracted"

# Scraping settings
REQUEST_TIMEOUT = 30  # seconds
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# LLM settings (OpenRouter)
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
MODEL = "google/gemini-2.5-flash-lite"
MAX_TOKENS = 4096
