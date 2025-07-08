import React from 'react';

const ContratoUsoPage: React.FC = () => (
  <div className="max-w-2xl mx-auto py-12 px-4 text-gray-800 bg-white rounded-lg shadow">
    <h1 className="text-2xl font-bold mb-6 text-center">Contrato de Uso y Disfrute</h1>
    <div className="space-y-4 text-justify">
      <p><strong>REUNIDOS</strong></p>
      <p>De una parte, Don/Doña [Propietario A], con DNI/NIF nº […].<br/>
      De otra parte, Don/Doña [Propietario B], con DNI/NIF nº […].<br/>
      De otra parte, Don/Doña [Propietario C], con DNI/NIF nº […].<br/>
      De otra parte, Don/Doña [Propietario D], con DNI/NIF nº […].</p>
      <p>Todos ellos copropietarios al 25% del inmueble sito en [dirección completa], inscrito en el Registro de la Propiedad de [localidad], bajo el número de finca registral [número].</p>
      <p><strong>MANIFIESTAN</strong></p>
      <p>Que desean regular el uso y disfrute de la propiedad, en beneficio de todas las partes y conforme a criterios de equidad.</p>
      <p><strong>ACUERDAN</strong></p>
      <p><strong>PRIMERO. – Objeto</strong><br/>
      Este contrato regula la distribución del uso temporal de la vivienda objeto de copropiedad entre los cuatro titulares.</p>
      <p><strong>SEGUNDO. – Uso exclusivo en verano</strong><br/>
      Se acuerda la siguiente distribución fija para el período estival de cada año:</p>
      <ul className="list-disc pl-6">
        <li>Propietario A: del 1 al 15 de julio.</li>
        <li>Propietario B: del 16 al 31 de julio.</li>
        <li>Propietario C: del 1 al 15 de agosto.</li>
        <li>Propietario D: del 16 de agosto al 1 de septiembre.</li>
      </ul>
      <p><strong>TERCERO. – Uso adicional (10 semanas anuales por propietario)</strong><br/>
      Cada copropietario tendrá derecho a 10 semanas adicionales de uso exclusivo por año, con el siguiente sistema:</p>
      <ul className="list-disc pl-6">
        <li>4 semanas a escoger entre los meses de mayo, junio, septiembre y octubre (temporada media).</li>
        <li>6 semanas a escoger entre los meses de noviembre, diciembre, enero, febrero, marzo y abril (temporada baja).</li>
      </ul>
      <p>La elección de estas semanas se realizará a través de una aplicación de reservas, concretamente la app Quincenalia.<br/>
      El orden de elección será rotatorio cada año (por ejemplo, en 2025 empieza el Propietario A, luego B, C, D, y en 2026 comienza B, etc.).<br/>
      Las reservas deberán realizarse antes del 15 de enero de cada año, salvo fuerza mayor.</p>
      <p><strong>CUARTO. – Normas de uso</strong><br/>
      Cada usuario será responsable del correcto uso, limpieza y conservación de la vivienda durante su periodo.<br/>
      Se prohíbe la cesión a terceros sin consentimiento expreso del resto.<br/>
      Cualquier desperfecto deberá ser comunicado y reparado por el usuario correspondiente.</p>
      <p><strong>QUINTO. – Gestión de gastos comunes</strong><br/>
      Los gastos comunes de la propiedad (suministros, mantenimiento, seguros, impuestos, reparaciones, etc.) serán:<br/>
      Gestionados mediante la aplicación Quincenalia.<br/>
      Repartidos a partes iguales entre los cuatro propietarios.<br/>
      Reportados en la app junto con las facturas digitalizadas correspondientes.<br/>
      A estos gastos se añadirá una cuota de gestión de 20 € mensuales por usuario, destinada a la administración general y al mantenimiento operativo de la app y sus servicios asociados. Esta cuota incluye 1 limpiezas al año por usuario.<br/>
      Las limpiezas adicionales correspondientes a las 10 semanas de uso flexible se pagarán aparte según tarifa vigente.<br/>
      El pago de dichos importes deberá realizarse dentro del plazo y por los medios establecidos en la aplicación.</p>
      <p><strong>SEXTO. – Vigencia y modificación</strong><br/>
      Este contrato entra en vigor desde la firma y tendrá vigencia indefinida, mientras se mantenga la copropiedad. Cualquier modificación requerirá acuerdo unánime y por escrito.</p>
      <p><strong>SÉPTIMO. – Jurisdicción</strong><br/>
      Para cualquier conflicto no resuelto amistosamente, las partes se someten a los Juzgados y Tribunales de [localidad].</p>
      <p>Y en prueba de conformidad, firman por cuadruplicado en el lugar y fecha al inicio indicados.</p>
      <p className="mt-8">Firmas:<br/>
      Propietario A: _________________________<br/>
      Propietario B: _________________________<br/>
      Propietario C: _________________________<br/>
      Propietario D: _________________________</p>
    </div>
  </div>
);

export default ContratoUsoPage; 