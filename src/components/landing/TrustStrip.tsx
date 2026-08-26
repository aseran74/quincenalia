import { Home, Calendar, RefreshCw, Users, Globe, Briefcase } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, stagger, viewportOnce } from '@/components/landing/motion';
import { cn } from '@/lib/utils';

const PROOF = [
  { icon: Home, value: '25%', label: 'Propiedad legal' },
  { icon: Calendar, value: '15 días', label: 'Fijos en verano' },
  { icon: RefreshCw, value: '10 semanas', label: 'Flexibles al año' },
  { icon: Users, value: '4 socios', label: 'Gastos compartidos' },
  { icon: Globe, value: 'Viaja gratis', label: 'Intercambio de estancias' },
  { icon: Briefcase, value: 'Gestión integral', label: 'Nos encargamos de todo' },
] as const;

export default function TrustStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="valor"
      aria-label="Propuesta de valor"
      className="relative z-10 bg-white"
    >
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <motion.header
          className="mx-auto max-w-2xl text-center mb-6 sm:mb-8"
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={viewportOnce}
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#783046] mb-2"
          >
            Copropiedad vacacional
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-snug"
          >
            Una fracción del coste. El 100% del verano.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Compras una participación real, reservas tus fechas y nosotros nos ocupamos del resto.
          </motion.p>
        </motion.header>

        <motion.ul
          className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={viewportOnce}
          variants={stagger}
        >
          {PROOF.map((item, index) => (
            <motion.li
              key={item.label}
              variants={fadeUp}
              className={cn(
                'px-3 py-4 sm:px-4 text-center',
                index > 0 && 'lg:border-l lg:border-[#E8DAD9]'
              )}
            >
              <item.icon className="mx-auto mb-2 h-4 w-4 text-[#783046]" aria-hidden="true" />
              <p className="landing-display text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
                {item.value}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-snug">{item.label}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
