import { TERMS_SECTIONS, TERMS_UPDATED_AT } from "@/lib/terms";

export function TermsContent() {
  return (
    <div className="space-y-5 text-sm leading-relaxed">
      <p className="text-xs text-muted-foreground">Última atualização: {TERMS_UPDATED_AT}</p>
      {TERMS_SECTIONS.map((s) => (
        <section key={s.title}>
          <h3 className="font-bold mb-1.5">{s.title}</h3>
          {s.body.map((p, i) => (
            <p key={i} className="text-muted-foreground mb-2">{p}</p>
          ))}
        </section>
      ))}
    </div>
  );
}
