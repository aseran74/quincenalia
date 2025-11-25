// Script para insertar agencias usando el cliente de Supabase del proyecto
import { createClient } from '@supabase/supabase-js';

// Las credenciales deberían estar disponibles vía MCP o variables de entorno
// Intentamos obtenerlas del entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: No se encontraron credenciales de Supabase');
  console.error('Por favor, asegúrate de que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Lista completa de agencias
const agencies = [
  { name: 'Aedas Homes', description: 'Promotora inmobiliaria líder en España especializada en vivienda residencial de calidad.', address: 'Madrid, España', phone: '+34 900 000 000', email: 'info@aedashomes.com', website: 'https://www.aedashomes.com' },
  { name: 'Metrovacesa', description: 'Una de las principales promotoras inmobiliarias de España con más de 100 años de experiencia.', address: 'Madrid, España', phone: '+34 900 000 001', email: 'info@metrovacesa.es', website: 'https://www.metrovacesa.es' },
  { name: 'Neinor Homes', description: 'Promotora inmobiliaria especializada en el desarrollo de proyectos residenciales de alta calidad.', address: 'Barcelona, España', phone: '+34 900 000 002', email: 'info@neinor.com', website: 'https://www.neinor.com' },
  { name: 'Vía Célere', description: 'Promotora inmobiliaria líder en el mercado español, especializada en vivienda nueva.', address: 'Madrid, España', phone: '+34 900 000 003', email: 'info@viacelere.com', website: 'https://www.viacelere.com' },
  { name: 'Habitat Inmobiliaria', description: 'Promotora inmobiliaria con amplia experiencia en el desarrollo de proyectos residenciales.', address: 'Barcelona, España', phone: '+34 900 000 004', email: 'info@habitat.es', website: 'https://www.habitat.es' },
  { name: 'Amenabar', description: 'Promotora inmobiliaria especializada en vivienda residencial y proyectos urbanísticos.', address: 'San Sebastián, España', phone: '+34 900 000 005', email: 'info@amenabar.com', website: 'https://www.amenabar.com' },
  { name: 'ASG Homes', description: 'Promotora inmobiliaria dedicada a la construcción de viviendas de calidad en toda España.', address: 'Valencia, España', phone: '+34 900 000 006', email: 'info@asghomes.es', website: 'https://www.asghomes.es' },
  { name: 'Kronos Homes', description: 'Promotora inmobiliaria especializada en proyectos residenciales de diseño y calidad.', address: 'Madrid, España', phone: '+34 900 000 007', email: 'info@kronoshomes.com', website: 'https://www.kronoshomes.com' },
  { name: 'Pryconsa', description: 'Promotora inmobiliaria con más de 50 años de experiencia en el sector.', address: 'Madrid, España', phone: '+34 900 000 008', email: 'info@pryconsa.com', website: 'https://www.pryconsa.com' },
  { name: 'Acciona Inmobiliaria', description: 'División inmobiliaria de Acciona, especializada en proyectos sostenibles y de alta calidad.', address: 'Madrid, España', phone: '+34 900 000 009', email: 'info@acciona-inmobiliaria.com', website: 'https://www.acciona-inmobiliaria.com' },
  { name: 'Culmia', description: 'Promotora inmobiliaria líder en el desarrollo de proyectos residenciales.', address: 'Madrid, España', phone: '+34 900 000 010', email: 'info@culmia.com', website: 'https://www.culmia.com' },
  { name: 'Insur Grupo', description: 'Grupo inmobiliario con amplia experiencia en promoción y gestión de proyectos residenciales.', address: 'Madrid, España', phone: '+34 900 000 011', email: 'info@insurgrupo.com', website: 'https://www.insurgrupo.com' },
  { name: 'TM Grupo Inmobiliario', description: 'Grupo inmobiliario especializado en promoción y gestión de proyectos residenciales y comerciales.', address: 'Madrid, España', phone: '+34 900 000 012', email: 'info@tmgrupo.com', website: 'https://www.tmgrupo.com' },
  { name: 'Gestilar', description: 'Promotora inmobiliaria especializada en proyectos residenciales de alta calidad.', address: 'Barcelona, España', phone: '+34 900 000 013', email: 'info@gestilar.com', website: 'https://www.gestilar.com' },
  { name: 'Caralca', description: 'Promotora inmobiliaria con experiencia en el desarrollo de proyectos residenciales.', address: 'Valencia, España', phone: '+34 900 000 014', email: 'info@caralca.com', website: 'https://www.caralca.com' },
  { name: 'Quadratia', description: 'Promotora inmobiliaria especializada en proyectos residenciales de diseño contemporáneo.', address: 'Madrid, España', phone: '+34 900 000 015', email: 'info@quadratia.com', website: 'https://www.quadratia.com' },
  { name: 'Procons Group', description: 'Grupo promotor especializado en proyectos residenciales y comerciales.', address: 'Barcelona, España', phone: '+34 900 000 016', email: 'info@proconsgroup.com', website: 'https://www.proconsgroup.com' },
  { name: 'Taylor Wimpey España', description: 'Filial española de Taylor Wimpey, una de las mayores promotoras del mundo.', address: 'Madrid, España', phone: '+34 900 000 017', email: 'info@taylorwimpey.es', website: 'https://www.taylorwimpey.es' },
  { name: 'Marbella Club Hills', description: 'Promotora especializada en proyectos residenciales de lujo en la Costa del Sol.', address: 'Marbella, España', phone: '+34 900 000 018', email: 'info@marbellaclubhills.com', website: 'https://www.marbellaclubhills.com' },
  { name: 'Dar Global', description: 'Promotora inmobiliaria internacional especializada en proyectos residenciales de alta gama.', address: 'Madrid, España', phone: '+34 900 000 019', email: 'info@darglobal.com', website: 'https://www.darglobal.com' },
  { name: 'Cordia', description: 'Promotora inmobiliaria especializada en proyectos residenciales y urbanísticos.', address: 'Barcelona, España', phone: '+34 900 000 020', email: 'info@cordia.es', website: 'https://www.cordia.es' },
  { name: 'Altaona Village', description: 'Promotora especializada en proyectos residenciales en la Costa Blanca.', address: 'Alicante, España', phone: '+34 900 000 021', email: 'info@altaonavillage.com', website: 'https://www.altaonavillage.com' },
  { name: 'Turis Promociones', description: 'Promotora inmobiliaria especializada en proyectos residenciales y turísticos.', address: 'Valencia, España', phone: '+34 900 000 022', email: 'info@turispromociones.com', website: 'https://www.turispromociones.com' },
  { name: 'Urmosa', description: 'Promotora inmobiliaria con experiencia en proyectos residenciales y comerciales.', address: 'Madrid, España', phone: '+34 900 000 023', email: 'info@urmosa.com', website: 'https://www.urmosa.com' },
  { name: 'Vapf', description: 'Promotora inmobiliaria especializada en proyectos residenciales de calidad.', address: 'Valencia, España', phone: '+34 900 000 024', email: 'info@vapf.com', website: 'https://www.vapf.com' },
  { name: 'Promopark', description: 'Promotora inmobiliaria especializada en proyectos residenciales y comerciales.', address: 'Madrid, España', phone: '+34 900 000 025', email: 'info@promopark.es', website: 'https://www.promopark.es' },
  { name: 'Sunplace', description: 'Promotora inmobiliaria especializada en proyectos residenciales en zonas costeras.', address: 'Alicante, España', phone: '+34 900 000 026', email: 'info@sunplace.es', website: 'https://www.sunplace.es' },
  { name: 'Victoria Playa', description: 'Promotora especializada en proyectos residenciales y turísticos en la Costa del Sol.', address: 'Málaga, España', phone: '+34 900 000 027', email: 'info@victoriaplaya.com', website: 'https://www.victoriaplaya.com' },
  { name: 'UrbesGolf Promociones', description: 'Promotora especializada en proyectos residenciales junto a campos de golf.', address: 'Marbella, España', phone: '+34 900 000 028', email: 'info@urbesgolf.com', website: 'https://www.urbesgolf.com' },
  { name: 'Suna Comercializadora', description: 'Comercializadora inmobiliaria especializada en la venta de viviendas nuevas.', address: 'Madrid, España', phone: '+34 900 000 029', email: 'info@suna.es', website: 'https://www.suna.es' },
  { name: 'Europa Promos', description: 'Promotora inmobiliaria especializada en proyectos residenciales en toda España.', address: 'Barcelona, España', phone: '+34 900 000 030', email: 'info@europapromos.com', website: 'https://www.europapromos.com' },
  { name: 'Ento (SNprojects)', description: 'Promotora inmobiliaria especializada en proyectos residenciales innovadores.', address: 'Madrid, España', phone: '+34 900 000 031', email: 'info@ento.es', website: 'https://www.ento.es' },
  { name: 'Convasa', description: 'Promotora inmobiliaria con experiencia en proyectos residenciales y comerciales.', address: 'Valencia, España', phone: '+34 900 000 032', email: 'info@convasa.com', website: 'https://www.convasa.com' },
  { name: 'Calida Homes', description: 'Promotora inmobiliaria especializada en viviendas de calidad y diseño.', address: 'Barcelona, España', phone: '+34 900 000 033', email: 'info@calidahomes.com', website: 'https://www.calidahomes.com' },
  { name: 'AJ Spain', description: 'Promotora inmobiliaria especializada en proyectos residenciales de alta calidad.', address: 'Madrid, España', phone: '+34 900 000 034', email: 'info@ajspain.com', website: 'https://www.ajspain.com' },
  { name: 'ATTC', description: 'Promotora inmobiliaria especializada en proyectos residenciales y comerciales.', address: 'Barcelona, España', phone: '+34 900 000 035', email: 'info@attc.es', website: 'https://www.attc.es' },
  { name: 'Zenia Paradise', description: 'Promotora especializada en proyectos residenciales de lujo en la Costa Blanca.', address: 'Alicante, España', phone: '+34 900 000 036', email: 'info@zeniaparadise.com', website: 'https://www.zeniaparadise.com' },
  { name: 'Zapata Projects', description: 'Promotora inmobiliaria especializada en proyectos residenciales de diseño.', address: 'Madrid, España', phone: '+34 900 000 037', email: 'info@zapataprojects.com', website: 'https://www.zapataprojects.com' },
  { name: 'Viviendízate', description: 'Promotora inmobiliaria especializada en proyectos residenciales accesibles.', address: 'Valencia, España', phone: '+34 900 000 038', email: 'info@viviendizate.com', website: 'https://www.viviendizate.com' },
  { name: 'Vistabella Golf', description: 'Promotora especializada en proyectos residenciales junto a campos de golf.', address: 'Alicante, España', phone: '+34 900 000 039', email: 'info@vistabellagolf.com', website: 'https://www.vistabellagolf.com' },
  { name: 'Triton', description: 'Promotora inmobiliaria especializada en proyectos residenciales y comerciales.', address: 'Madrid, España', phone: '+34 900 000 040', email: 'info@triton.es', website: 'https://www.triton.es' },
  { name: 'Torregolf Homes', description: 'Promotora especializada en proyectos residenciales de lujo junto a campos de golf.', address: 'Marbella, España', phone: '+34 900 000 041', email: 'info@torregolfhomes.com', website: 'https://www.torregolfhomes.com' },
  { name: 'New Homes Global', description: 'Promotora inmobiliaria internacional especializada en proyectos residenciales.', address: 'Madrid, España', phone: '+34 900 000 042', email: 'info@newhomesglobal.com', website: 'https://www.newhomesglobal.com' },
  { name: 'Rigech', description: 'Empresa especializada en gestión vacacional y alquiler de propiedades turísticas.', address: 'Marbella, España', phone: '+34 900 000 043', email: 'info@rigech.com', website: 'https://www.rigech.com' },
  { name: 'GuestReady', description: 'Plataforma de gestión vacacional para propiedades turísticas.', address: 'Barcelona, España', phone: '+34 900 000 044', email: 'info@guestready.com', website: 'https://www.guestready.com' },
  { name: 'Weguest', description: 'Empresa especializada en gestión vacacional y servicios para propiedades turísticas.', address: 'Madrid, España', phone: '+34 900 000 045', email: 'info@weguest.com', website: 'https://www.weguest.com' },
  { name: 'TheKey Host', description: 'Servicios de gestión vacacional y alquiler de propiedades turísticas.', address: 'Málaga, España', phone: '+34 900 000 046', email: 'info@thekeyhost.com', website: 'https://www.thekeyhost.com' },
  { name: 'The Charming Concept', description: 'Empresa de gestión vacacional especializada en propiedades de lujo.', address: 'Marbella, España', phone: '+34 900 000 047', email: 'info@thecharmingconcept.com', website: 'https://www.thecharmingconcept.com' },
  { name: 'REMAX España', description: 'Red inmobiliaria internacional líder en el mercado español.', address: 'Madrid, España', phone: '+34 900 000 048', email: 'info@remax.es', website: 'https://www.remax.es' },
  { name: 'Lucas Fox', description: 'Inmobiliaria especializada en propiedades de lujo en la Costa del Sol y Barcelona.', address: 'Marbella, España', phone: '+34 900 000 049', email: 'info@lucasfox.com', website: 'https://www.lucasfox.com' },
  { name: 'Engel & Völkers', description: 'Inmobiliaria internacional especializada en propiedades premium y de lujo.', address: 'Madrid, España', phone: '+34 900 000 050', email: 'info@engelvoelkers.es', website: 'https://www.engelvoelkers.es' },
  { name: 'Century 21', description: 'Red inmobiliaria internacional con presencia en toda España.', address: 'Madrid, España', phone: '+34 900 000 051', email: 'info@century21.es', website: 'https://www.century21.es' },
  { name: 'Tecnocasa', description: 'Red inmobiliaria especializada en la comercialización de propiedades.', address: 'Barcelona, España', phone: '+34 900 000 052', email: 'info@tecnocasa.es', website: 'https://www.tecnocasa.es' },
  { name: 'Donpiso', description: 'Red inmobiliaria con amplia presencia en toda España.', address: 'Madrid, España', phone: '+34 900 000 053', email: 'info@donpiso.com', website: 'https://www.donpiso.com' },
  { name: 'Activum Real Estate Consulting', description: 'Consultoría inmobiliaria especializada en inversiones y desarrollo.', address: 'Madrid, España', phone: '+34 900 000 054', email: 'info@activum.com', website: 'https://www.activum.com' },
  { name: 'Nozar', description: 'Inmobiliaria especializada en propiedades residenciales y comerciales.', address: 'Barcelona, España', phone: '+34 900 000 055', email: 'info@nozar.com', website: 'https://www.nozar.com' },
  { name: 'Amenavar', description: 'Inmobiliaria especializada en propiedades residenciales y comerciales.', address: 'San Sebastián, España', phone: '+34 900 000 056', email: 'info@amenavar.com', website: 'https://www.amenavar.com' },
  { name: 'Carteia Homes', description: 'Inmobiliaria especializada en propiedades residenciales de calidad.', address: 'Madrid, España', phone: '+34 900 000 057', email: 'info@carteiahomes.com', website: 'https://www.carteiahomes.com' },
  { name: 'SunPlace', description: 'Inmobiliaria especializada en propiedades en zonas costeras.', address: 'Alicante, España', phone: '+34 900 000 058', email: 'info@sunplace.es', website: 'https://www.sunplace.es' },
  { name: 'AJ Spain Properties', description: 'Inmobiliaria especializada en propiedades residenciales de alta calidad.', address: 'Madrid, España', phone: '+34 900 000 059', email: 'info@ajspainproperties.com', website: 'https://www.ajspainproperties.com' },
  { name: 'Vistabella Golf Homes', description: 'Inmobiliaria especializada en propiedades junto a campos de golf.', address: 'Alicante, España', phone: '+34 900 000 060', email: 'info@vistabellagolfhomes.com', website: 'https://www.vistabellagolfhomes.com' },
  { name: 'Grupo Insur', description: 'Grupo inmobiliario con amplia experiencia en promoción y gestión de proyectos.', address: 'Madrid, España', phone: '+34 900 000 061', email: 'info@grupoinsur.com', website: 'https://www.grupoinsur.com' },
];

async function insertAgencies() {
  console.log(`\n🚀 Iniciando inserción de ${agencies.length} agencias inmobiliarias...\n`);
  
  const batchSize = 10;
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  
  for (let i = 0; i < agencies.length; i += batchSize) {
    const batch = agencies.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(agencies.length / batchSize);
    
    console.log(`📦 Procesando lote ${batchNum}/${totalBatches} (${batch.length} agencias)...`);
    
    const { data, error } = await supabase
      .from('real_estate_agencies')
      .insert(batch)
      .select();
    
    if (error) {
      // Si el error es por duplicado, intentar insertar una por una
      if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
        console.log(`  ⚠️  Algunas agencias pueden ser duplicadas, insertando una por una...`);
        for (const agency of batch) {
          const { data: singleData, error: singleError } = await supabase
            .from('real_estate_agencies')
            .insert(agency)
            .select();
          if (singleError) {
            if (singleError.code === '23505' || singleError.message.includes('duplicate') || singleError.message.includes('unique')) {
              skipped++;
              console.log(`    ⏭️  ${agency.name} ya existe, omitida`);
            } else {
              errors++;
              console.error(`    ❌ Error con ${agency.name}:`, singleError.message);
            }
          } else {
            inserted++;
            console.log(`    ✅ ${agency.name} insertada`);
          }
        }
      } else {
        console.error(`  ❌ Error en lote ${batchNum}:`, error.message);
        errors++;
      }
    } else {
      inserted += data?.length || 0;
      console.log(`  ✅ Lote ${batchNum} insertado correctamente: ${data?.length || 0} agencias`);
    }
  }
  
  console.log(`\n📊 Resumen:`);
  console.log(`  ✅ Insertadas: ${inserted}`);
  console.log(`  ⏭️  Omitidas (duplicados): ${skipped}`);
  console.log(`  ❌ Errores: ${errors}`);
  console.log(`\n✨ Proceso completado!\n`);
}

insertAgencies().catch(console.error);

