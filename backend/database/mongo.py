from pymongo import MongoClient

# Replace <username>, <password>, and <dbname> with your Atlas credentials
MONGO_URI = "mongodb+srv://vaidehi31:vaidu2121@cluster0.jimo1ou.mongodb.net/?appName=Cluster0"
client = MongoClient(MONGO_URI)

# Select your database
db = client["TouristSafety"]  # you can rename "tourist_db" to anything

# Collections
zones_col = db["zones"]  
alerts_col = db["alerts"] 
tourists_col = db["tourists"]
locations_col = db["locations"]
       # if you have a collection for alerts

print("MongoDB Atlas connected ✅")