from fastapi import FastAPI

app = FastAPI(title="CRM Bebidas API")


@app.get("/")
def read_root():
    return {"message": "API do CRM de bebidas online"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
