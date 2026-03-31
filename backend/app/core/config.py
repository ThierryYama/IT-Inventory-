from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import TypedDict
import os

from dotenv import load_dotenv

ROOT_DIR: Path = Path(__file__).resolve().parents[3]
load_dotenv(ROOT_DIR / '.env')


class TortoiseModelConfig(TypedDict):
    models: list[str]
    default_connection: str


class TortoiseAppsConfig(TypedDict):
    models: TortoiseModelConfig


class TortoiseConfig(TypedDict):
    connections: dict[str, str]
    apps: TortoiseAppsConfig
    use_tz: bool
    timezone: str


@dataclass(frozen=True)
class AppSettings:
    project_name: str
    environment: str
    backend_host: str
    backend_port: int
    postgres_db: str
    postgres_user: str
    postgres_password: str
    postgres_host: str
    postgres_port: int

    @property
    def database_url(self) -> str:
        return (
            f'postgres://{self.postgres_user}:{self.postgres_password}'
            f'@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}'
        )

    @property
    def tortoise_config(self) -> TortoiseConfig:
        return {
            'connections': {
                'default': self.database_url,
            },
            'apps': {
                'models': {
                    'models': ['app.models'],
                    'default_connection': 'default',
                },
            },
            'use_tz': False,
            'timezone': 'UTC',
        }


def getEnvironmentValue(key: str, default_value: str) -> str:
    return os.getenv(key, default_value)


@lru_cache
def getSettings() -> AppSettings:
    """Builds the application settings from environment variables."""
    return AppSettings(
        project_name=getEnvironmentValue('PROJECT_NAME', 'IT Backend'),
        environment=getEnvironmentValue('APP_ENV', 'development'),
        backend_host=getEnvironmentValue('BACKEND_HOST', '0.0.0.0'),
        backend_port=int(getEnvironmentValue('BACKEND_PORT', '8000')),
        postgres_db=getEnvironmentValue('POSTGRES_DB', 'it_db'),
        postgres_user=getEnvironmentValue('POSTGRES_USER', 'postgres'),
        postgres_password=getEnvironmentValue('POSTGRES_PASSWORD', 'postgres'),
        postgres_host=getEnvironmentValue('POSTGRES_HOST', 'localhost'),
        postgres_port=int(getEnvironmentValue('POSTGRES_PORT', '5432')),
    )
