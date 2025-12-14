const Logo = () => {
  return (
    <div className="font-lexend text-[3rem] font-black">
      GATEWAY
    </div>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-8 py-4">
        <Logo />
      </header>
      <main className="p-8">
        {/* App content goes here */}
      </main>
    </div>
  );
};

export default App;
