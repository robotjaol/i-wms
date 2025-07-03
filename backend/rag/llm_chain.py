import os
from langchain_community.llms.ollama import Ollama
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

def run_llm_chain(query, context):
    model_name = os.getenv("OLLAMA_MODEL_NAME", "llama3")
    llm = Ollama(model=model_name)
    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template="Given the following context:\n{context}\n\nAnswer the question: {question}\n\nCite sources if possible."
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    return chain.run({"context": context, "question": query}) 