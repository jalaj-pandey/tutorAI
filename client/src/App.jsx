import Form from './Form';
import Quiz from './Quiz';

const App = () => {

  

 
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">AI Tutor</h1>
        <Form/>
        <Quiz/>
    </div>
  );
};

export default App;
