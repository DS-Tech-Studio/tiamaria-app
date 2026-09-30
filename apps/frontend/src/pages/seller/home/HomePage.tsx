import { Hero } from './components/Hero';

export const HomePage = () => {
  return (
    <div className="flex-1 flex items-center justify-center w-full h-full overflow-hidden">
      <Hero />
    </div>
  );
};

export default HomePage;