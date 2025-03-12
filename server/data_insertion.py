from pinecone import Pinecone
from pypdf import PdfReader
from langchain.text_splitter import CharacterTextSplitter


pc = Pinecone(api_key="pcsk_vPKRs_Uua4PhynRFk9DkiBfxX56ZE6NhD1j3jb4gRdMvttXSg7nExjTSJi6UqTL7PHp96")


index_name = "dense-index"
if not pc.has_index(index_name):
    pc.create_index_for_model(
        name=index_name,
        dimension=512,  
        metric="cosine",  
        pod_type="p1",
        cloud="aws",
        embed = {
            "model" : "llma-text-embed-v2",
            "filed_map" : {"text" : "chunk_text"}
        } 
    )

reader = PdfReader("sample.pdf")

print(len(reader.pages))

text = " "

for page in reader.pages:
    extracted_text = page.extract_text()
    if extracted_text:
        text += extracted_text + "\n"

text_splitter = CharacterTextSplitter(
    separator="\n",  
    chunk_size=1000,  
    chunk_overlap=50  
)

docs = text_splitter.create_documents([text])
data = docs[0].page_content

records = []
c = 0
for x in docs:
    record = {
        "_id": str(c),
        "chunk_text" : x.page_content
    }
    c += 1
    records.append(record)

print(records)

print(f"Inserted {len(records)} records into Pinecone.")