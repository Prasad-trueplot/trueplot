from app.db.init_db import create_database_tables
from app.db.seed import seed_sample_data
from app.db.session import SessionLocal


def main() -> None:
    create_database_tables()
    db = SessionLocal()
    try:
        seed_sample_data(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()

