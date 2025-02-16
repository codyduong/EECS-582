# scraper-target

This scraper sample uses [`uv`](https://github.com/astral-sh/uv) as the python package/project manager.

## Setup

```sh
uv python install 3.12
uv sync
.venv\Scripts\activate
uv pip install .
playwright install --with-deps
deactivate
```

## Running

```sh
uv run targetscraper.py
```
