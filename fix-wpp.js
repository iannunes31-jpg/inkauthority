const fs = require('fs');
let html = fs.readFileSync('public/index-nova.html', 'utf8');

const oldHandleSubmit = `async handleSubmit(e) {
    e.preventDefault();
    if (this.state.sending) return;
    const data = Object.fromEntries(new FormData(e.target).entries());
    this.setState({ sending: true });
    const url = this.props.webhookUrl;
    if (url) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, source: 'landing-ink-authority', ts: new Date().toISOString() })
        });
      } catch (err) { /* silent — still confirm to lead */ }
    }
    try { localStorage.setItem('ia_lead', JSON.stringify(data)); } catch (err) {}
    this.setState({ submitted: true, sending: false });
  }`;

const newHandleSubmit = `async handleSubmit(e) {
    e.preventDefault();
    if (this.state.sending) return;
    const data = Object.fromEntries(new FormData(e.target).entries());
    this.setState({ sending: true });
    const url = this.props.webhookUrl;
    if (url) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, source: 'landing-ink-authority', ts: new Date().toISOString() })
        });
      } catch (err) { /* silent — still confirm to lead */ }
    }
    try { localStorage.setItem('ia_lead', JSON.stringify(data)); } catch (err) {}
    
    let msg = "Olá, acabei de garantir meu acesso antecipado para o workshop da Ink Authority!\\n\\nMeus dados:\\n";
    for (const [key, value] of Object.entries(data)) {
        msg += key + ": " + value + "\\n";
    }
    const waUrl = "https://wa.me/5521986895497?text=" + encodeURIComponent(msg);
    
    this.setState({ submitted: true, sending: false, dynamicWaLink: waUrl });
    window.open(waUrl, '_blank');
  }`;

html = html.replace(oldHandleSubmit, newHandleSubmit);

const oldRenderVals = `renderVals() {
    return {
      onSubmit: (e) => this.handleSubmit(e),
      showForm: !this.state.submitted,
      showSuccess: this.state.submitted,
      waLink: this.props.whatsappLink || '#lista'
    };
  }`;

const newRenderVals = `renderVals() {
    return {
      onSubmit: (e) => this.handleSubmit(e),
      showForm: !this.state.submitted,
      showSuccess: this.state.submitted,
      waLink: this.state.dynamicWaLink || this.props.whatsappLink || '#lista'
    };
  }`;

html = html.replace(oldRenderVals, newRenderVals);

fs.writeFileSync('public/index-nova.html', html);
console.log('index-nova.html modified to send data to WhatsApp');
