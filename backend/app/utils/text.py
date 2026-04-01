from unicodedata import normalize


def normalizeText(value: str) -> str:
    normalized_value: str = normalize('NFKD', value)
    ascii_value: str = normalized_value.encode('ascii', 'ignore').decode('ascii')
    return ''.join(character for character in ascii_value.lower().strip() if character.isalnum())


def normalizeOptionalText(value: str | None) -> str | None:
    if value is None:
        return None
    stripped_value: str = value.strip()
    if stripped_value == '':
        return None
    return stripped_value
