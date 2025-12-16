import os
from langchain import hub
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_community.document_loaders import PyPDFLoader 
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

class ProfileChat: 
    def __init__(self, model='gemini-2.5-flash', embedding_model='gemini-embedding-001'):
        load_dotenv()
        self.google_api_key = os.environ["GEMINI_API_KEY"]
        self.model = model
        self.embedding_model = embedding_model
    
    