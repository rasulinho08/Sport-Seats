# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base
# from app import User, DATABASE_URL

# engine = create_engine(DATABASE_URL)
# Session = sessionmaker(bind=engine)

# if __name__ == "__main__":
#     session = Session()
#     try:
#         user = session.query(User).filter_by(email="mamishovrasul028@gmail.com").first()
#         if user:
#             session.delete(user)
#             session.commit()
#             print("Admin user deleted successfully.")
#         else:
#             print("Admin user not found.")
#     finally:
#         session.close()
