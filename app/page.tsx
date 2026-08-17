import Image from "next/image";
import Link from "next/link";
import { FloatingMenu } from "@/components/FloatingMenu";
import { ChatWidget } from "@/components/ChatWidget";

export default function LandingPage() {
  return (
    <>
      <main className="bg-[#faf9f5] min-h-screen text-black w-full overflow-hidden font-sans">
        <div style={{"position":"relative","width":"100%","overflow":"hidden"}}>

  {/* HERO + FORM */}
  <section style={{"position":"relative","minHeight":"100svh","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"flex-start","padding":"clamp(72px,15vh,150px) 22px clamp(24px,4vh,44px)"}}>
    <div data-parallax={0.14} style={{"position":"absolute","inset":"-12% -20%","zIndex":"0","backgroundImage":"url('/ipad-mockup.jpeg')","backgroundSize":"190%","backgroundPosition":"center 12%","filter":"blur(14px) brightness(.5) grayscale(.35)","opacity":".42"}}></div>
    <div style={{"position":"absolute","inset":"0","zIndex":"1","background":"radial-gradient(120% 75% at 50% -10%,rgba(120,120,128,.26),transparent 55%),radial-gradient(100% 90% at 50% 118%,rgba(0,0,0,.78),transparent 60%)"}}></div>
    <div aria-hidden="true" style={{"position":"absolute","inset":"0","zIndex":"1","display":"flex","alignItems":"center","justifyContent":"center","pointerEvents":"none","overflow":"hidden"}}><span style={{"fontFamily":"'Jost',sans-serif","fontWeight":"200","fontSize":"clamp(112px,34vw,400px)","letterSpacing":".16em","whiteSpace":"nowrap","transform":"scale(1.5) translateY(-6%)","filter":"blur(9px)","opacity":".055","background":"linear-gradient(180deg,#ffffff,#c9c9cf 55%,#8f9096 72%,#f0f0f4)","WebkitBackgroundClip":"text","backgroundClip":"text","color":"transparent"}}>INK AUTHORITY</span></div>
    <div aria-hidden="true" style={{"position":"absolute","top":"50%","left":"50%","transform":"translate(-50%,-50%)","width":"min(150vw,1100px)","height":"min(150vw,1100px)","zIndex":"1","pointerEvents":"none","opacity":".045"}}>
      <div style={{"position":"absolute","inset":"0","border":"1px solid #cfcfd6","borderRadius":"50%","animation":"spinCW 68s linear infinite"}}><span style={{"position":"absolute","top":"-9px","left":"50%","transform":"translateX(-50%)","fontSize":"16px","color":"#cfcfd6"}}>✦</span></div>
      <div style={{"position":"absolute","inset":"17%","border":"1px solid #cfcfd6","borderRadius":"50%","animation":"spinCCW 52s linear infinite"}}><span style={{"position":"absolute","top":"-8px","left":"50%","transform":"translateX(-50%)","fontSize":"13px","color":"#cfcfd6"}}>✦</span></div>
      <div style={{"position":"absolute","inset":"34%","border":"1px solid #cfcfd6","borderRadius":"50%","animation":"spinCW 38s linear infinite"}}><span style={{"position":"absolute","top":"-7px","left":"50%","transform":"translateX(-50%)","fontSize":"11px","color":"#cfcfd6"}}>✦</span></div>
    </div>

    <div style={{"position":"relative","zIndex":"2","width":"100%","maxWidth":"540px","display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center"}}>
      <h1 style={{"margin":"0","fontFamily":"'Jost',sans-serif","fontWeight":"200","fontSize":"clamp(42px,11vw,104px)","lineHeight":"1","letterSpacing":"clamp(.1em,1.7vw,.26em)","background":"linear-gradient(176deg,#ffffff 0%,#d3d3d9 40%,#7c7d84 60%,#f4f4f7 100%)","WebkitBackgroundClip":"text","backgroundClip":"text","color":"transparent"}}>INK&nbsp;AUTHORITY</h1>

      <div style={{"display":"flex","alignItems":"center","justifyContent":"center","gap":"14px","width":"100%","maxWidth":"420px","marginTop":"clamp(16px,3vh,26px)"}}>
        <span style={{"height":"1px","flex":"1","background":"linear-gradient(90deg,transparent,rgba(210,210,220,.5))"}}></span>
        <span style={{"fontSize":"15px","background":"linear-gradient(180deg,#fff,#9a9aa0)","WebkitBackgroundClip":"text","backgroundClip":"text","color":"transparent"}}>✦</span>
        <span style={{"height":"1px","flex":"1","background":"linear-gradient(90deg,rgba(210,210,220,.5),transparent)"}}></span>
      </div>

      <div style={{"display":"flex","alignItems":"center","gap":"clamp(9px,2vw,18px)","marginTop":"clamp(14px,2.6vh,22px)","fontFamily":"'Jost',sans-serif","fontWeight":"300","fontSize":"clamp(10px,1.6vw,15px)","letterSpacing":".28em","textTransform":"uppercase","color":"rgba(238,238,242,.66)","flexWrap":"wrap","justifyContent":"center"}}>
        <span>Posicionamento</span><span style={{"color":"rgba(200,200,210,.45)","fontSize":"10px"}}>✦</span><span>Técnica</span><span style={{"color":"rgba(200,200,210,.45)","fontSize":"10px"}}>✦</span><span>Estratégia</span>
      </div>

      <div style={{"position":"relative","width":"100%","marginTop":"clamp(64px,11vh,110px)"}}>
        <div id="venn" aria-hidden="true" style={{"position":"absolute","top":"50%","left":"50%","transform":"translate(-50%,-50%)","width":"min(112%,470px)","height":"min(112vw,470px)","pointerEvents":"none","opacity":".3","zIndex":"0"}}>
          <svg viewBox="0 0 400 400" style={{"position":"absolute","inset":"0","width":"100%","height":"100%","overflow":"visible","filter":"drop-shadow(0 0 18px rgba(206,206,220,.2))"}}>
            <circle data-anim="true" cx="200" cy="150" r="124" fill="none" stroke="rgba(220,220,228,.7)" strokeWidth="1" strokeDasharray="780" strokeDashoffset="780" style={{"animation":"cycleCircle 12s cubic-bezier(.6,.05,.25,1) infinite","animationPlayState":"paused"}}></circle>
            <circle data-anim="true" cx="140" cy="250" r="124" fill="none" stroke="rgba(220,220,228,.7)" strokeWidth="1" strokeDasharray="780" strokeDashoffset="780" style={{"animation":"cycleCircle 12s cubic-bezier(.6,.05,.25,1) infinite","animationDelay":".7s","animationPlayState":"paused"}}></circle>
            <circle data-anim="true" cx="260" cy="250" r="124" fill="none" stroke="rgba(220,220,228,.7)" strokeWidth="1" strokeDasharray="780" strokeDashoffset="780" style={{"animation":"cycleCircle 12s cubic-bezier(.6,.05,.25,1) infinite","animationDelay":"1.4s","animationPlayState":"paused"}}></circle>
          </svg>
          <div data-anim="true" style={{"position":"absolute","top":"52%","left":"50%","width":"44%","height":"36%","transform":"translate(-50%,-50%)","background":"radial-gradient(circle,rgba(212,212,226,.4),transparent 70%)","filter":"blur(9px)","opacity":"0","animation":"glowPulse 6s ease-in-out infinite","animationDelay":"3.6s","animationPlayState":"paused"}}></div>
        </div>

        <div style={{"position":"relative","zIndex":"1"}}>
          <h2 data-reveal="" style={{"margin":"0","fontFamily":"'Jost',sans-serif","fontWeight":"200","fontSize":"clamp(31px,7.2vw,60px)","lineHeight":"1.1","color":"#f4f4f7"}}>Uma comunidade feita<br/>de <span style={{"fontWeight":"500","background":"linear-gradient(180deg,#ffffff,#eaeaef 60%,#c9c9cf)","WebkitBackgroundClip":"text","backgroundClip":"text","color":"transparent"}}>tatuador para tatuador</span>.</h2>
          <p data-reveal="" data-delay="100" style={{"margin":"clamp(30px,5vh,52px) auto 0","maxWidth":"440px","fontWeight":"300","fontSize":"clamp(15px,2.3vw,19px)","lineHeight":"1.65","color":"rgba(238,238,242,.68)"}}>Um espaço para tatuadores que querem ir além da técnica. Entre no grupo e receba novidades e conteúdos em primeira mão, perto de quem busca o mesmo que você.</p>
        </div>
      </div>
    </div>

    <a href="#form" style={{"position":"absolute","bottom":"26px","left":"50%","transform":"translateX(-50%)","zIndex":"2","display":"flex","flexDirection":"column","alignItems":"center","gap":"8px"}}>
      <span style={{"fontSize":"10px","letterSpacing":".3em","textTransform":"uppercase","color":"rgba(238,238,242,.45)"}}>Role</span>
      <span style={{"position":"relative","width":"1px","height":"34px","background":"rgba(255,255,255,.16)","overflow":"hidden"}}><span style={{"position":"absolute","top":"0","left":"0","width":"1px","height":"12px","background":"linear-gradient(180deg,#fff,transparent)","animation":"scrollDot 2.2s ease-in-out infinite"}}></span></span>
    </a>
  </section>

  {/* FORM */}
  <section id="form" style={{"position":"relative","minHeight":"100svh","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"flex-start","padding":"clamp(60px,11vh,110px) 22px clamp(40px,6vh,70px)","background":"#08080a","borderTop":"1px solid rgba(255,255,255,.06)","overflow":"hidden"}}>
    <div data-parallax={0.07} style={{"position":"absolute","inset":"-12% -20%","zIndex":"0","backgroundImage":"url('/ipad-mockup.jpeg')","backgroundSize":"190%","backgroundPosition":"center 60%","filter":"blur(16px) brightness(.42) grayscale(.4)","opacity":".3"}}></div>
    <div style={{"position":"absolute","inset":"0","zIndex":"1","background":"radial-gradient(100% 80% at 50% 50%,transparent,rgba(8,8,10,.8))"}}></div>

    <div style={{"position":"relative","zIndex":"2","width":"100%","maxWidth":"460px","display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center"}}>
      <span data-reveal="" style={{"fontSize":"11px","letterSpacing":".34em","textTransform":"uppercase","color":"rgba(238,238,242,.45)"}}>Entre na comunidade</span>
      <h2 data-reveal="" data-delay="80" style={{"margin":"18px 0 0","fontFamily":"'Jost',sans-serif","fontWeight":"200","fontSize":"clamp(24px,5.4vw,42px)","lineHeight":"1.12","color":"#f4f4f7"}}>Seu acesso ao grupo</h2>
      
        <form   style={{"width":"100%","marginTop":"clamp(28px,5vh,44px)","display":"flex","flexDirection":"column","gap":"16px","textAlign":"left"}}>
          <input name="nome" required placeholder="Nome" style={{"background":"rgba(255,255,255,.03)","border":"1px solid rgba(255,255,255,.13)","borderRadius":"11px","color":"#f3f3f6","fontSize":"16px","padding":"15px 16px","outline":"none","transition":"border-color .4s,background .4s"}}  />
          <input name="whatsapp" required inputMode="tel" placeholder="WhatsApp com DDD" style={{"background":"rgba(255,255,255,.03)","border":"1px solid rgba(255,255,255,.13)","borderRadius":"11px","color":"#f3f3f6","fontSize":"16px","padding":"15px 16px","outline":"none","transition":"border-color .4s,background .4s"}}  />
          <input name="email" type="email" required placeholder="E-mail" style={{"background":"rgba(255,255,255,.03)","border":"1px solid rgba(255,255,255,.13)","borderRadius":"11px","color":"#f3f3f6","fontSize":"16px","padding":"15px 16px","outline":"none","transition":"border-color .4s,background .4s"}}  />
          <button type="submit" disabled={false} style={{"background":"linear-gradient(180deg,#f4f4f6,#c8c8ce)", "color":"#0a0a0c", "padding":"18px", "borderRadius":"12px", "fontSize":"14px", "fontWeight":"700", "letterSpacing":".12em", "textTransform":"uppercase", "border":"none", "cursor":"pointer", "marginTop":"8px"}}>Quero Entrar</button>
          <p style={{"margin":"0","textAlign":"center","fontSize":"12px","lineHeight":"1.5","color":"rgba(238,238,242,.38)"}}>Vagas limitadas. Seus dados são usados apenas para o seu acesso ao grupo.</p>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"center","gap":"clamp(9px,2vw,18px)","marginTop":"clamp(34px,7vh,64px)","fontFamily":"'Jost',sans-serif","fontWeight":"300","fontSize":"clamp(10px,1.6vw,14px)","letterSpacing":".28em","textTransform":"uppercase","color":"rgba(238,238,242,.5)","flexWrap":"wrap"}}>
            <span>Posicionamento</span><span style={{"color":"rgba(200,200,210,.4)","fontSize":"10px"}}>✦</span><span>Técnica</span><span style={{"color":"rgba(200,200,210,.4)","fontSize":"10px"}}>✦</span><span>Estratégia</span>
          </div>
        </form>
      

      
        <div style={{"width":"100%","marginTop":"clamp(28px,5vh,44px)","textAlign":"center"}}>
          <div style={{"position":"relative","height":"3px","borderRadius":"100px","background":"rgba(255,255,255,.08)","overflow":"hidden"}}>
            <div style={{"width":"100%", "height":"100%", "background":"#fff", "borderRadius":"100px"}}></div>
            <div style={{"position":"absolute","inset":"0","background":"linear-gradient(100deg,transparent 20%,rgba(255,255,255,.85) 50%,transparent 80%)","backgroundSize":"220% 100%","animation":"sheen 1.05s linear infinite","mixBlendMode":"overlay"}}></div>
          </div>
          <p style={{"margin":"18px 0 0","fontFamily":"'Jost',sans-serif","fontWeight":"300","fontSize":"12px","letterSpacing":".3em","textTransform":"uppercase","color":"rgba(238,238,242,.5)"}}>Confirmando</p>
        </div>
      

      
        <div style={{"width":"100%","marginTop":"clamp(28px,5vh,44px)","textAlign":"center"}}>
          <span style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","width":"64px","height":"64px","border":"1px solid rgba(255,255,255,.28)","borderRadius":"100px","fontSize":"22px","background":"linear-gradient(180deg,#fff,#9a9aa0)","WebkitBackgroundClip":"text","backgroundClip":"text","color":"transparent"}}>✦</span>
          <h3 style={{"margin":"22px 0 10px","fontFamily":"'Jost',sans-serif","fontWeight":"300","fontSize":"clamp(21px,4vw,30px)","color":"#f3f3f6"}}>Cadastro confirmado</h3>
          <p style={{"margin":"0 auto 24px","maxWidth":"360px","fontWeight":"300","fontSize":"15px","lineHeight":"1.6","color":"rgba(238,238,242,.6)"}}>Toque no botão abaixo para entrar no grupo de WhatsApp agora.</p>
          <a href="https://chat.whatsapp.com/G35Z5P4p73n6sD2E2zR8yV" target="_blank" rel="noopener" style={{"display":"inline-block","fontSize":"13px","letterSpacing":".18em","textTransform":"uppercase","color":"#0a0a0c","background":"linear-gradient(180deg,#f4f4f6,#c8c8ce)","padding":"17px 32px","borderRadius":"100px","fontWeight":"700"}}>Acessar o grupo</a>
        </div>
      
    </div>
  </section>

  {/* PROVA */}
  <section style={{"position":"relative","background":"#08080a","borderTop":"1px solid rgba(255,255,255,.06)","padding":"clamp(56px,9vh,110px) 22px"}}>
    <p data-reveal="" style={{"margin":"0 auto","maxWidth":"520px","textAlign":"center","fontFamily":"'Jost',sans-serif","fontWeight":"300","fontStyle":"italic","fontSize":"clamp(18px,3vw,26px)","lineHeight":"1.4","color":"#e8e8ec"}}>"O cliente compra o artista antes da arte."</p>
    <p data-reveal="" data-delay="160" style={{"margin":"14px auto 0","textAlign":"center","fontSize":"12px","letterSpacing":".24em","textTransform":"uppercase","color":"rgba(238,238,242,.42)"}}>Isabella Badini</p>
  </section>

  {/* FOOTER */}
  <footer style={{"position":"relative","background":"#08080a","borderTop":"1px solid rgba(255,255,255,.06)","padding":"clamp(44px,7vh,80px) 22px 42px","textAlign":"center"}}>
    <h2 style={{"margin":"0","fontFamily":"'Jost',sans-serif","fontWeight":"200","fontSize":"clamp(20px,4.6vw,42px)","letterSpacing":"clamp(.12em,1.4vw,.22em)","background":"linear-gradient(176deg,#ffffff,#d3d3d9 42%,#7c7d84 62%,#f4f4f7)","WebkitBackgroundClip":"text","backgroundClip":"text","color":"transparent"}}>INK&nbsp;AUTHORITY</h2>
    <p style={{"margin":"16px 0 0","fontWeight":"300","fontSize":"14px","color":"rgba(238,238,242,.52)"}}>A nova era da tatuagem. Do tatuador para o tatuador.</p>
    <p style={{"margin":"24px 0 0","fontSize":"11px","letterSpacing":".1em","color":"rgba(238,238,242,.3)"}}>© Ink Authority · Isabella Badini</p>
  </footer>

</div>

      </main>
      <FloatingMenu />
      <ChatWidget />
    </>
  );
}
