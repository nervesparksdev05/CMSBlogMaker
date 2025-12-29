import markdown as md

def markdown_to_html(markdown_text: str) -> str:
    # production-friendly: basic extensions
    return md.markdown(
        markdown_text,
        extensions=["extra", "tables", "fenced_code", "sane_lists"],
        output_format="html5",
    )
