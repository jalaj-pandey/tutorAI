from config import conn_pinecorn,conn_gemini
class TutorService():
    index_name = "dense-index"

    # function for sementic Search in the vector DB
    def __semantic_search(self, question):
        pc = conn_pinecorn()
        dense_index = pc.Index(self.index_name)
        results = dense_index.search(
        namespace="example-namespace",
        query={
            "top_k": 5,
            "inputs": {
                'text': question
            }
        }
    )
        return results
    
    # function to create prompt for the llm model
    def __get_prompt(self, question, context):
        prompt = f"""
    You are an experienced Java developer with deep knowledge of object-oriented programming, design patterns, and best practices. 
    Provide clear, detailed, and beginner-friendly explanations, focusing on helping the user understand the logic and structure of the code. 
    response should be in two lines.
    question : {question} \n
    context : {context}
    """
        return prompt


    # function for creating context from chunks
    def __get_context(self, chunks):
        llmtext = ""
        for hit in chunks['result']['hits']:
            llmtext = llmtext +" "+hit['fields']['chunk_text']
        return llmtext
    
    # function that return the responce of llm model
    def __execute_prompt(self, prompt):
        client = conn_gemini()
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=prompt
        )
        print(response.text)
        return response.text
    
    def get_question_answer(self, question):
        semantic_result = self.__semantic_search(question)
        context = self.__get_context(semantic_result)
        prompt = self.__get_prompt(question,context)
        response = self.__execute_prompt(prompt)

        return response