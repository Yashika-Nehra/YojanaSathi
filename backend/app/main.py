import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError

from .config import FRONTEND_ORIGINS
from .db import ensure_indexes
from .routes import auth, schemes, system

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("yojanasathi")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        ensure_indexes()
        log.info("MongoDB indexes ensured")
    except Exception as e:
        log.warning("MongoDB not reachable at startup: %s", e)
    yield


app = FastAPI(title="YojanaSathi API", version="1.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS or ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"] ,
)


@app.exception_handler(PyMongoError)
async def db_error(request: Request, exc: PyMongoError):
    # Never log request bodies, so profiles/passwords are not written to logs.
    log.error("Database error: %s", exc)
    return JSONResponse(
        status_code=503,
        content={"detail": "Database unavailable, please retry in a moment."},
    )


app.include_router(system.router, prefix="/api")
app.include_router(schemes.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
