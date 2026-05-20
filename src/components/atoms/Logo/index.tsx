import LogoImg from 'app/assets/logo.png';
export function Logo() {
  return (
    <div className='flex items-center gap-2 shrink-0'>
      <div className='flex items-center justify-center'>
        <img className='w-10 h-10' src={LogoImg} alt='logo-caplander' />
      </div>
      <span className='text-primary font-bold text-2xl tracking-tight'>Caplander</span>
    </div>
  );
}
