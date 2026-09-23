export const Hero = () => {
  return (
    <section className="relative w-full flex flex-col items-center justify-center text-center px-4 select-none overflow-hidden">
      {/* Título Principal */}
      <h1 className="relative font-serif text-7xl md:text-9xl font-bold tracking-tight text-white drop-shadow-2xl opacity-0 animate-slide-left">
        Tía Mari
      </h1>

      {/* Subtítulo con ligero retraso */}
      <p className="relative font-serif italic text-3xl md:text-4xl text-[var(--color-caramelo)] mt-2 drop-shadow-md opacity-0 animate-slide-left delay-150">
        Artesanal
      </p>
    </section>
  );
};