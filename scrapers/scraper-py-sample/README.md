# scraper-sample

This scraper sample uses [`uv`](https://github.com/astral-sh/uv) as the python package/project manager.

## Development

If you are using vscode with sensible python extensions then you can have type annotations, python
IDE support for your specific venv by first in your teminal running:

```sh
uv python install 3.12                # use latest python
uv sync
.venv\Scripts\activate
uv pip install .
deactivate                            # optional, if you want to stay in the env
```

Then in vscode:

`CTRL+SHIFT+P` >
`Python: Select intepreter` > 
`Enter interpreter path...` >
`.\scrapers\scraper-py-sample\.venv\python`

![development_setup](./docs/development-setup1.gif)

## Running

```sh
uv run main.py "./sample_products.json"   # run the scraper
uv run main.py --help                     # view scraper help command
```

## Formatting

This project uses [ruff](https://github.com/astral-sh/ruff) for code-style/formatting. 
You can run it through the terminal or VSCode command palette

```sh
uv run ruff format
```

Assuming you have the ruff formatter extension installed:
https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff

`CTRL+SHIFT+P` >
`Format Document`
