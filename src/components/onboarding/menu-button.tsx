import { MenuButtonProps } from '@/types';
import Link from 'next/link';

const MenuButton = ({ href, icon, title, colors, delay }: MenuButtonProps) => (
  <Link
    href={href}
    className="group relative animate-fade-in-up"
    style={{ animationDelay: delay }}
  >
    <div
      className={`relative z-10 flex w-full items-center gap-4 rounded-2xl border-4 border-white/50 p-5 text-left font-bold transition-transform duration-300 ease-out group-hover:-translate-y-3 ${colors.bg} ${colors.text}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="font-comic text-xl drop-shadow-md md:text-2xl">
        {title}
      </span>
    </div>
    <div
      className={`absolute inset-0 rounded-2xl ${colors.shadow} translate-y-1`}
    ></div>
  </Link>
);

export default MenuButton;
