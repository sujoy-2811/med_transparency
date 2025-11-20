import { Shield, Database, Eye, CheckCircle } from 'lucide-react'

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading font-extrabold text-[#1B4965] text-3xl mb-3">About MedTransparency</h1>
        <p className="text-[#6B7280] text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Lora, serif' }}>
          We believe every patient deserves to know the real cost of healthcare before making decisions that affect their financial and physical wellbeing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: Database, title: 'Crowdsourced Data', desc: 'Every data point comes from a real patient who shared their experience voluntarily. No estimates, no hospital marketing.' },
          { icon: Shield, title: 'Verified & Anonymised', desc: 'All submissions are screened for personal information before publishing. We store and display only aggregated statistics.' },
          { icon: Eye, title: 'Transparent Methodology', desc: 'Our ranking algorithm, data collection process, and verification criteria are fully documented and open to scrutiny.' },
        ].map(item => (
          <div key={item.title} className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <div className="w-10 h-10 bg-[#1B4965]/10 rounded-lg flex items-center justify-center mb-4">
              <item.icon className="w-5 h-5 text-[#1B4965]" />
            </div>
            <h3 className="font-heading font-bold text-[#1B4965] mb-2">{item.title}</h3>
            <p className="text-sm text-[#6B7280]" style={{ fontFamily: 'Lora, serif' }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div id="verification" className="bg-white border border-[#E5E7EB] rounded-xl p-8 mb-8">
        <h2 className="font-heading font-bold text-[#1B4965] text-xl mb-5">Data Verification Process</h2>
        <div className="space-y-4">
          {[
            { step: '01', title: 'Submission', desc: 'Patients submit procedure data via our structured form. Required fields include procedure, hospital, cost, wait time, and outcome score.' },
            { step: '02', title: 'Automated screening', desc: 'Submissions pass through automated checks for outlier costs (± 3 standard deviations), required fields, and currency validity.' },
            { step: '03', title: 'Aggregation', desc: 'Verified submissions are aggregated. A minimum of 3 data points are required before a hospital/procedure combination appears publicly.' },
            { step: '04', title: 'Testimony review', desc: 'Written testimonials are reviewed by our team to remove any personally identifiable information before publication.' },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="w-8 h-8 bg-[#1B4965] text-white rounded-lg flex items-center justify-center text-xs font-heading font-bold shrink-0">{item.step}</div>
              <div>
                <h4 className="font-heading font-semibold text-[#1B4965] mb-1">{item.title}</h4>
                <p className="text-sm text-[#6B7280]" style={{ fontFamily: 'Lora, serif' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="privacy" className="bg-[#1B4965]/5 border border-[#1B4965]/15 rounded-xl p-8 mb-8">
        <h2 className="font-heading font-bold text-[#1B4965] text-xl mb-4">Privacy & Anonymisation</h2>
        <div className="space-y-3">
          {[
            'Your email address is never associated with your submissions',
            'Submissions can be made without creating an account',
            'Location data is only stored at the country/city level',
            'Testimony text is reviewed and stripped of personal details',
            'We do not sell, share, or license any user data to third parties',
            'Data is stored on encrypted servers within the EU/UK',
          ].map(item => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-sm text-[#4B5563]" style={{ fontFamily: 'Lora, serif' }}>{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
        <h2 className="font-heading font-bold text-[#1B4965] text-xl mb-3">Disclaimer</h2>
        <p className="text-sm text-[#6B7280] leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
          MedTransparency provides crowdsourced information for educational and research purposes only. All data is self-reported by patients and may not reflect current prices or availability. This platform does not provide medical advice. Always consult a qualified medical professional before making healthcare decisions. Cost data should be used as a starting point for research, not as a guarantee of prices you will pay.
        </p>
      </div>
    </div>
  )
}
