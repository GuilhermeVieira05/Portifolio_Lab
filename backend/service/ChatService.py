from repository.ChatRepository import ChatRepository
import os
from langchain import hub
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_community.document_loaders import PyPDFLoader 
from langchain.prompts import PromptTemplate
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pathlib import Path
from model.Chat import ProfileChat
from langchain.globals import set_llm_cache
from langchain_community.cache import SQLiteCache

set_llm_cache(SQLiteCache(database_path=".profile.db"))


class ChatService(ChatRepository):
    def __init__(self):
        self.chat = ProfileChat()
        self.persist_dir = Path(__file__).parent.parent / 'data' / 'profile_information'
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        self.collection_name = "profile_information"

    def _get_model(self):
        return ChatGoogleGenerativeAI(
            model=self.chat.model,
            google_api_key=self.chat.google_api_key
        )
    
    def _get_context(self, path):
        loader = PyPDFLoader(path)

        try:
            vector_store = Chroma(
                embedding_function=embedding,
                collection_name=self.collection_name,
                persist_directory=str(self.persist_dir)
            )
            if len(vector_store.get()["ids"]) > 0:
                return vector_store.as_retriever()
        except Exception:
            pass


        docs = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )

        chunks = text_splitter.split_documents(
            documents=docs
        )

        embedding = GoogleGenerativeAIEmbeddings(model=self.chat.embedding_model, google_api_key=self.chat.google_api_key)

        vector_store = Chroma.from_documents(
            documents=chunks,
            embedding=embedding,
            collection_name="profile_information",
            persist_directory=str(self.persist_dir)
        )

        return vector_store.as_retriever()

    def _get_prompt(self, prompt=None):
        if prompt is None:
            returned_prompt = hub.pull('rlm/rag-prompt')
        else:
            returned_prompt = PromptTemplate(
            input_variables=["question", "context"],
            template=prompt
        )
        return returned_prompt
    
    async def get_response(self, question, prompt=None):

        prompt = self._get_prompt(prompt) if prompt else self._get_prompt()
        path = Path(__file__).parent.parent / 'media/Profile.pdf'

        rag_chain = (
            {
                'context': self._get_context(path),
                'question': RunnablePassthrough()
            }
            | prompt
            | self._get_model()
            | StrOutputParser()
        )
        
        return rag_chain.invoke(question)
        