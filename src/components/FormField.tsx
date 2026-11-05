export function Field({ label, value, onChange, type = 'text', wide = false, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; wide?: boolean; required?: boolean }) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span>{label}{required ? ' *' : ''}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}
