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

## Formatting

This project uses [ruff](https://github.com/astral-sh/ruff) for code-style/formatting. 
You can run it through the terminal or VSCode command palette

```sh
uv run ruff format
```

## Demo

![demo](./docs/demo1.gif)
