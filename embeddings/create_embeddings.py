import json
from pathlib import Path
from chromadb import PersistentClient
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_DIR = BASE_DIR / "db"

# 1) Embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# 2) Create persistent DB client
client = PersistentClient(path=str(DB_DIR))

# Delete old collection to avoid duplicate records
try:
    client.delete_collection("bank_data")
except Exception:
    pass

collection = client.get_or_create_collection(name="bank_data")

# 3) Load all JSON files
with open(DATA_DIR / "users.json", encoding="utf-8") as f:
    users = json.load(f)

with open(DATA_DIR / "accounts.json", encoding="utf-8") as f:
    accounts = json.load(f)

with open(DATA_DIR / "transactions.json", encoding="utf-8") as f:
    transactions = json.load(f)

with open(DATA_DIR / "general.json", encoding="utf-8") as f:
    faqs = json.load(f)

extended_faq_path = DATA_DIR / "general_extended.json"
if extended_faq_path.exists():
    with open(extended_faq_path, encoding="utf-8") as f:
        extended_faqs = json.load(f)
    if isinstance(extended_faqs, list):
        faqs.extend(extended_faqs)

# Load newly added advanced bank knowledge
with open(DATA_DIR / "advanced_bank_knowledge.json", encoding="utf-8") as f:
    advanced_knowledge = json.load(f)

# Load credit profiles
credit_profiles_path = DATA_DIR / "credit_profiles.json"
if credit_profiles_path.exists():
    with open(credit_profiles_path, encoding="utf-8") as f:
        credit_profiles = json.load(f)
else:
    credit_profiles = []

# 4) Build documents
records = []

for u in users:
    text = (
        f"User profile. User ID: {u['user_id']}. Name: {u['name']}. "
        f"District: {u['district']}. User type: {u['user_type']}. "
        f"Mobile: {u['mobile']}."
    )
    records.append(
        {
            "document": text,
            "metadata": {
                "type": "user",
                "user_id": u["user_id"],
                "language": "en",
            },
        }
    )

for a in accounts:
    text = (
        f"Account details. User ID: {a['user_id']}. "
        f"Account number: {a['account_number']}. "
        f"Account type: {a['account_type']}. Balance: {a['balance']} rupees."
    )
    records.append(
        {
            "document": text,
            "metadata": {
                "type": "account",
                "user_id": a["user_id"],
                "account_number": a["account_number"],
                "language": "en",
            },
        }
    )

for t in transactions:
    text = (
        f"Transaction history. Transaction ID: {t['transaction_id']}. "
        f"User ID: {t['user_id']}. Type: {t['type']}. Amount: {t['amount']} rupees. "
        f"Date: {t['date']}. Description: {t['description']}."
    )
    records.append(
        {
            "document": text,
            "metadata": {
                "type": "transaction",
                "user_id": t["user_id"],
                "transaction_id": t["transaction_id"],
                "txn_type": t["type"],
                "language": "en",
            },
        }
    )

for g in faqs:
    if "question" in g and "answer" in g:
        text = (
            f"FAQ. Question: {g['question']} "
            f"Answer: {g['answer']} "
            f"Intent: {g.get('intent', 'unknown')} "
            f"Language: {g.get('language', 'unknown')}"
        )
        records.append(
            {
                "document": text,
                "metadata": {
                    "type": "faq",
                    "intent": g.get("intent", "unknown"),
                    "language": g.get("language", "unknown"),
                },
            }
        )

for category, content in advanced_knowledge.items():
    if isinstance(content, dict):
        for sub_category, details in content.items():
            text = f"Bank Knowledge about {category.replace('_', ' ')} - {sub_category.replace('_', ' ')}. Information: {json.dumps(details, ensure_ascii=False)}"
            records.append(
                {
                    "document": text,
                    "metadata": {
                        "type": "advanced_knowledge",
                        "category": category,
                        "sub_category": sub_category,
                        "language": "en"
                    }
                }
            )
    else:
        text = f"Bank Knowledge about {category.replace('_', ' ')}. Information: {json.dumps(content, ensure_ascii=False)}"
        records.append(
            {
                "document": text,
                "metadata": {
                    "type": "advanced_knowledge",
                    "category": category,
                    "language": "en"
                }
            }
        )

for cp in credit_profiles:
    text = (
        f"Credit profile for User ID: {cp['user_id']}. "
        f"Monthly income: {cp['monthly_income']}. "
        f"Employment type: {cp['employment_type']}. "
        f"CIBIL score: {cp.get('cibil_score', 'N/A')}. "
        f"Credit Rating: {cp.get('credit_rating', 'N/A')}. "
        f"Total Credit Limit: {cp.get('total_credit_limit', 0)}. "
        f"Existing Loans: {json.dumps(cp.get('existing_loans', []))}."
    )
    records.append(
        {
            "document": text,
            "metadata": {
                "type": "credit_profile",
                "user_id": cp["user_id"],
                "language": "en",
            },
        }
    )

# 5) Encode and store
print("Generating embeddings...")

documents = [r["document"] for r in records]
metadatas = [r["metadata"] for r in records]
ids = [f"id_{i}" for i in range(len(records))]

embeddings = model.encode(documents).tolist()

collection.add(
    documents=documents,
    embeddings=embeddings,
    metadatas=metadatas,
    ids=ids,
)

print(f"Embeddings created and stored in {DB_DIR}")
print("Total embeddings stored:", collection.count())
