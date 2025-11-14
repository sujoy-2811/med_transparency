import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { proceduresApi } from '../api/procedures'
import { regionsApi } from '../api/regions'
import { hospitalsApi } from '../api/hospitals'
import { submissionsApi, type SubmissionCreate } from '../api/submissions'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'

const schema = z.object({
  procedure_id: z.string().min(1, 'Select a procedure'),
  hospital_id: z.string().min(1, 'Enter hospital ID'),
  cost_usd: z.coerce.number().positive('Enter a valid cost'),
  original_cost: z.coerce.number().positive(),
  currency: z.string().min(3).max(3),
  wait_days: z.coerce.number().min(0),
  outcome_score: z.coerce.number().min(1).max(10),
  testimony: z.string().max(2000).optional(),
})

type FormData = z.infer<typeof schema>

const STEPS = ['Procedure', 'Cost & Wait', 'Outcome', 'Review']

export function Contribute() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('')

  const { data: procedures = [] } = useQuery({ queryKey: ['procedures'], queryFn: () => proceduresApi.list() })
  const { data: regions = [] } = useQuery({ queryKey: ['regions'], queryFn: () => regionsApi.list() })
  const { data: hospitals = [] } = useQuery({
    queryKey: ['hospitals', selectedRegion],
    queryFn: () => hospitalsApi.list(selectedRegion || undefined),
    enabled: !!selectedRegion,
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { currency: 'USD', outcome_score: 8, original_cost: 0 },
  })

  const mutation = useMutation({
    mutationFn: (data: SubmissionCreate) => submissionsApi.create(data),
    onSuccess: () => setSubmitted(true),
  })

  const onSubmit = (data: any) => mutation.mutate({ ...data, testimony: data.testimony || undefined } as SubmissionCreate)

  if (submitted) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="font-heading font-bold text-[#1B4965] text-2xl mb-2">Thank you!</h2>
      <p className="text-[#6B7280] mb-6" style={{ fontFamily: 'Lora, serif' }}>Your data has been submitted anonymously and will help other patients make informed decisions.</p>
      <Button onClick={() => navigate('/search')}>Explore all data</Button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-heading font-extrabold text-[#1B4965] text-2xl mb-1">Contribute Your Data</h1>
      <p className="text-[#6B7280] mb-8">All submissions are anonymous and aggregated. No personally identifiable information is stored.</p>

      {/* Progress */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading font-bold shrink-0 ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#1B4965] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <div className={`h-0.5 flex-1 ${i < STEPS.length - 1 ? (i < step ? 'bg-green-500' : 'bg-[#E5E7EB]') : 'hidden'}`} />
          </div>
        ))}
      </div>

      <form onSubmit={(handleSubmit as any)(onSubmit)}>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-5">
          {step === 0 && (
            <>
              <h2 className="font-heading font-bold text-[#1B4965] mb-4">Which procedure did you have?</h2>
              <Select
                label="Procedure"
                options={[{ value: '', label: 'Select a procedure...' }, ...procedures.map(p => ({ value: p.id, label: p.name }))]}
                error={errors.procedure_id?.message}
                {...register('procedure_id')}
              />
              <Select
                label="Country / Region"
                options={[{ value: '', label: 'Select a region...' }, ...regions.map(r => ({ value: r.id, label: `${r.flag_emoji ?? ''} ${r.name}` }))]}
                value={selectedRegion}
                onChange={e => { setSelectedRegion(e.target.value); setValue('hospital_id', '') }}
              />
              <Select
                label="Hospital"
                options={[
                  { value: '', label: selectedRegion ? 'Select a hospital...' : 'Select a region first...' },
                  ...hospitals.map(h => ({ value: h.id, label: `${h.name} — ${h.city}` })),
                ]}
                error={errors.hospital_id?.message}
                disabled={!selectedRegion}
                {...register('hospital_id')}
              />
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-heading font-bold text-[#1B4965] mb-4">Cost and wait time</h2>
              <Input label="Total cost (USD)" type="number" placeholder="e.g. 8500" error={errors.cost_usd?.message} {...register('cost_usd')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Original cost" type="number" placeholder="In local currency" {...register('original_cost')} />
                <Input label="Currency (ISO)" placeholder="USD, EUR, THB..." maxLength={3} {...register('currency')} />
              </div>
              <Input label="Wait time (days from booking to procedure)" type="number" placeholder="e.g. 14" error={errors.wait_days?.message} {...register('wait_days')} />
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-heading font-bold text-[#1B4965] mb-4">Outcome and experience</h2>
              <div>
                <label className="text-sm font-heading font-medium text-[#1B4965] block mb-2">Outcome score (1 = poor, 10 = excellent)</label>
                <input type="range" min={1} max={10} className="w-full accent-[#1B4965]" {...register('outcome_score')} />
                <div className="flex justify-between text-xs text-[#6B7280] mt-1">
                  <span>1 – Poor</span>
                  <span className="font-heading font-bold text-[#1B4965]">{watch('outcome_score')}/10</span>
                  <span>10 – Excellent</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-heading font-medium text-[#1B4965] block mb-1">Your experience (optional, anonymised)</label>
                <textarea rows={4} placeholder="Describe what went well, any surprises, and advice for others..."
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]/30 resize-none"
                  {...register('testimony')} />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🔒</div>
              <h2 className="font-heading font-bold text-[#1B4965] text-lg mb-2">Your privacy is protected</h2>
              <p className="text-[#6B7280] text-sm mb-4" style={{ fontFamily: 'Lora, serif' }}>Your submission will be anonymised, aggregated with other reports, and never linked to your identity.</p>
              <div className="bg-[#F8F9FA] rounded-lg p-4 text-left space-y-2 text-sm">
                <div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span>No name, email, or personal details stored with submission</span></div>
                <div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span>Testimony reviewed for PII before publishing</span></div>
                <div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span>Only aggregate statistics shown publicly</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-5">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)} icon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
          ) : <div />}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep(s => s + 1)} icon={<ChevronRight className="w-4 h-4" />}>Next</Button>
          ) : (
            <Button type="submit" loading={mutation.isPending} variant="primary">Submit anonymously</Button>
          )}
        </div>
      </form>
    </div>
  )
}
