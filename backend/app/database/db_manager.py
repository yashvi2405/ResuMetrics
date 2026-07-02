from motor.motor_asyncio import AsyncIOMotorClient
from app.config import Config

class MongoManager:
    def __init__(self):
        self.mongo_url = Config.MONGO_URL
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[Config.MONGO_DB_NAME]

mongo_manager = MongoManager()

async def get_db():
    return mongo_manager.db

async def get_next_sequence_value(sequence_name: str) -> int:
    result = await mongo_manager.db["counters"].find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"sequence_value": 1}},
        upsert=True,
        return_document=True
    )
    return result["sequence_value"]

class MongoModel:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            if k == "_id":
                continue
            setattr(self, k, v)