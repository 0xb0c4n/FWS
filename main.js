class Modal {
    constructor(modalId, boxId, closeId, openSelectors) {
      this.modal = document.getElementById(modalId);
      this.box = document.getElementById(boxId);
      this.closeBtn = document.getElementById(closeId);
  
      document.querySelectorAll(openSelectors).forEach(btn => {
        if (btn) btn.addEventListener("click", () => this.open());
      });
  
      this.closeBtn?.addEventListener("click", () => this.close());
  
      this.modal?.addEventListener("click", (e) => {
        if (e.target === this.modal) this.close();
      });
    }
  
    open() {
      this.modal?.classList.remove("hidden");
      this.box?.classList.remove("opacity-0","scale-95");
      this.box?.classList.add("opacity-100","scale-100");
    }
  
    close() {
      this.modal?.classList.add("hidden");
      this.box?.classList.add("opacity-0","scale-95");
    }
  }
  
  class SignupModal extends Modal {
    constructor(modalId, boxId, closeId, openSelectors, stepsSelectors, indicatorsIds) {
      super(modalId, boxId, closeId, openSelectors);
  
      this.steps = [...document.querySelectorAll(stepsSelectors)];
      this.indicators = indicatorsIds.map(id => document.getElementById(id));
      this.currentStep = 0;
  
      const fadeIn = document.createElement("style");
      fadeIn.innerHTML = `
        @keyframes fadeIn { 
          from {opacity:0; transform:translateY(10px);} 
          to {opacity:1; transform:translateY(0);} 
        }
        .animate-fadeIn { animation: fadeIn .4s ease-out; }
      `;
      document.head.appendChild(fadeIn);
  
      this.bindNav();
    }
  
    showStep(i) {
      this.steps.forEach((s, idx) => {
        s.classList.add("hidden");
        if (idx === i) {
          s.classList.remove("hidden");
          s.classList.add("animate-fadeIn");
        }
      });
  
      this.indicators.forEach((ind, idx) => {
        const circle = ind.querySelector("span");
        if (idx <= i) {
          circle.className =
            "block w-8 h-8 mx-auto rounded-full bg-primary-600 text-white flex items-center justify-center";
        } else {
          circle.className =
            "block w-8 h-8 mx-auto rounded-full bg-slate-300 dark:bg-slate-700 text-slate-500 flex items-center justify-center";
        }
      });
  
      this.currentStep = i;
    }
  
    bindNav() {
      // On attend que les boutons existent
      const next1 = document.getElementById("next1");
      const prev2 = document.getElementById("prev2");
      const next2 = document.getElementById("next2");
      const prev3 = document.getElementById("prev3");
      const next3 = document.getElementById("next3");
      const prev4 = document.getElementById("prev4");
  
      next1?.addEventListener("click", () => this.showStep(1));
      prev2?.addEventListener("click", () => this.showStep(0));
      next2?.addEventListener("click", () => this.showStep(2));
      prev3?.addEventListener("click", () => this.showStep(1));
      next3?.addEventListener("click", () => this.showStep(3));
      prev4?.addEventListener("click", () => this.showStep(2));
    }
  
    open() {
      super.open();
      this.showStep(0); 
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    new Modal("loginModal", "loginBox", "closeLogin", "#openLogin, #openLoginHero, #openLoginMobile");
  
    new SignupModal(
      "signupModal",
      "signupBox",
      "closeSignup",
      "#openSignup, #openSignupHero, #openSignupMobile",
      ".step",
      ["step1Indicator", "step2Indicator", "step3Indicator", "step4Indicator"]
    );
  });
  