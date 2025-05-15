from logging.config import fileConfig
import os
import sys

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add the project root to sys.path to allow importing app modules
# Assumes env.py is in alembic/ and backend/ is the project root for app.*
PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, PROJECT_DIR)

# add your model's MetaData object here
# for 'autogenerate' support
from app.database import Base # Import Base from your application's database module
# from app.models import user_model, pod_model, profile_model # Ensure all models are imported so Base knows about them
# It's generally better if app.database.Base already has all tables registered via imports in models/__init__.py or similar

target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Récupérer l'URL de la base de données depuis la variable d'environnement
    db_url_env = os.environ.get('DATABASE_URL')

    # Préparer la configuration pour engine_from_config
    # Cela prend la section [alembic] de alembic.ini comme base
    configuration = config.get_section(config.config_ini_section, {})

    if db_url_env:
        # Si DATABASE_URL est définie dans l'environnement, l'utiliser
        # Cela surcharge toute valeur de sqlalchemy.url de alembic.ini
        print(f"INFO: Using DATABASE_URL from environment: {db_url_env.split('@')[0]}@...masked...") # Log pour confirmation
        configuration['sqlalchemy.url'] = db_url_env
    else:
        # Si DATABASE_URL n'est pas définie, utiliser la valeur de alembic.ini (pour dev local par ex.)
        print(f"INFO: DATABASE_URL not found in environment, using sqlalchemy.url from alembic.ini: {configuration.get('sqlalchemy.url')}")

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
