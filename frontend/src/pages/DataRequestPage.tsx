import { useState } from 'react';

/* ── Kansas Counties (105) ─────────────────────────────────── */
const KANSAS_COUNTIES = [
  'Allen','Anderson','Atchison','Barber','Barton','Bourbon','Brown','Butler',
  'Chase','Chautauqua','Cherokee','Cheyenne','Clark','Clay','Cloud','Coffey',
  'Comanche','Cowley','Crawford','Decatur','Dickinson','Doniphan','Douglas',
  'Edwards','Elk','Ellis','Ellsworth','Finney','Ford','Franklin','Geary',
  'Gove','Graham','Grant','Gray','Greeley','Greenwood','Hamilton','Harper',
  'Harvey','Haskell','Hodgeman','Jackson','Jefferson','Jewell','Johnson',
  'Kearny','Kingman','Kiowa','Labette','Lane','Leavenworth','Lincoln','Linn',
  'Logan','Lyon','Marion','Marshall','McPherson','Meade','Miami','Mitchell',
  'Montgomery','Morris','Morton','Nemaha','Neosho','Ness','Norton','Osage',
  'Osborne','Ottawa','Pawnee','Phillips','Pottawatomie','Pratt','Rawlins',
  'Reno','Republic','Rice','Riley','Rooks','Rush','Russell','Saline',
  'Scott','Sedgwick','Seward','Shawnee','Sheridan','Sherman','Smith','Stafford',
  'Stanton','Stevens','Sumner','Thomas','Trego','Wabaunsee','Wallace',
  'Washington','Wichita','Wilson','Woodson','Wyandotte',
];

const CITATION_TEXT = `Chandramouli S. (2026). The Kansas Data Science Education Atlas. Kansas State University. https://github.com/csrisurya/The-Kansas-Data-Science-Education-Atlas`;

/* ── Types ─────────────────────────────────────────────────── */
interface DatasetRequestForm {
  datasets: string[];
  geoScope: string;
  specificCounties: string[];
  regionType: string;
  dataFormat: string;
  intendedUse: string;
  name: string;
  email: string;
  organization: string;
  agreeTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

/* ── Helpers ───────────────────────────────────────────────── */
const DATASETS = [
  { key: 'dataset1', label: 'Dataset 1: K-12 & Colleges' },
  { key: 'dataset2', label: 'Dataset 2: County Aggregations' },
  { key: 'dataset3', label: 'Dataset 3: DS/AI Course Inventory' },
  { key: 'dataset4', label: 'Dataset 4: College Locations' },
  { key: 'dataset5', label: 'Dataset 5: Digital Infrastructure' },
  { key: 'dataset6', label: 'Dataset 6: Socioeconomic Data' },
  { key: 'dataset7', label: 'Dataset 7: Atlas (All Combined)' },
];

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ── Component ─────────────────────────────────────────────── */
const DataRequestPage: React.FC = () => {
  /* ---- Dataset form state ---- */
  const [dataset, setDataset] = useState<DatasetRequestForm>({
    datasets: [],
    geoScope: 'all',
    specificCounties: [],
    regionType: '',
    dataFormat: 'CSV',
    intendedUse: '',
    name: '',
    email: '',
    organization: '',
    agreeTerms: false,
  });

  const [datasetErrors, setDatasetErrors] = useState<FormErrors>({});
  const [datasetSuccess, setDatasetSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [citationCopied, setCitationCopied] = useState(false);

  /* ---- Dataset helpers ---- */
  const toggleDataset = (d: string) =>
    setDataset(prev => ({
      ...prev,
      datasets: prev.datasets.includes(d) ? prev.datasets.filter(x => x !== d) : [...prev.datasets, d],
    }));

  const toggleDatasetCounty = (c: string) =>
    setDataset(prev => ({
      ...prev,
      specificCounties: prev.specificCounties.includes(c)
        ? prev.specificCounties.filter(x => x !== c)
        : [...prev.specificCounties, c],
    }));

  const validateDataset = (): boolean => {
    const errors: FormErrors = {};
    if (dataset.datasets.length === 0) errors.datasets = 'Dataset Selection';
    if (!dataset.intendedUse.trim()) errors.intendedUse = 'Intended Use';
    if (!dataset.geoScope) errors.geoScope = 'Geographic Scope';
    if (dataset.geoScope === 'specific' && dataset.specificCounties.length === 0)
      errors.specificCounties = 'Specific Counties';
    if (dataset.geoScope === 'region' && !dataset.regionType) errors.regionType = 'Region Type';
    if (!dataset.dataFormat) errors.dataFormat = 'Data Format';
    if (!dataset.name.trim()) errors.name = 'Contact Name';
    if (!dataset.email.trim()) errors.email = 'Contact Email';
    else if (!validateEmail(dataset.email)) errors.email = 'A valid Email address';
    if (!dataset.agreeTerms) errors.agreeTerms = 'Terms Agreement';
    setDatasetErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmitDataset = async () => {
    if (!validateDataset()) return;
    setDatasetErrors({});
    setSubmitError('');
    setSubmitting(true);

    try {
      const { apiService } = await import('../services/api');
      const result = await apiService.submitDataRequest({
        request_type: 'dataset',
        datasets: dataset.datasets,
        geographic_scope: dataset.geoScope,
        counties: dataset.geoScope === 'specific' ? dataset.specificCounties : undefined,
        data_format: dataset.dataFormat,
        intended_use: dataset.intendedUse,
        name: dataset.name,
        email: dataset.email,
        organization: dataset.organization || undefined,
        agree_to_terms: dataset.agreeTerms,
      });

      setSuccessMessage(result.message);
      setDatasetSuccess(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCitation = () => {
    navigator.clipboard.writeText(CITATION_TEXT);
    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2000);
  };

  /* ---- Shared UI pieces ---- */
  const fieldError = (msg?: string) =>
    msg ? <p className="text-red-500 text-sm mt-1">{msg}</p> : null;

  const radioBtn = (
    name: string,
    value: string,
    checked: boolean,
    onChange: () => void,
  ) => (
    <label className="flex items-center gap-3 cursor-pointer text-base text-gray-700">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="accent-indigo-600 w-5 h-5"
      />
      {value}
    </label>
  );

  const checkbox = (
    label: string,
    checked: boolean,
    onChange: () => void,
    error?: boolean,
  ) => (
    <label className={`flex items-center gap-3 cursor-pointer text-base ${error ? 'text-red-500' : 'text-gray-700'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-indigo-600 w-5 h-5 rounded"
      />
      {label}
    </label>
  );

  const sectionLabel = (text: string) => (
    <h4 className="text-lg font-semibold text-gray-800 mb-3">{text}</h4>
  );

  /* ---- Multi-select dropdown ---- */
  const CountyMultiSelect = ({
    selected,
    toggle,
    id,
  }: {
    selected: string[];
    toggle: (c: string) => void;
    id: string;
  }) => {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const filtered = KANSAS_COUNTIES.filter(c => c.toLowerCase().includes(filter.toLowerCase()));
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-base text-left bg-white hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
        >
          {selected.length === 0 ? 'Select counties…' : `${selected.length} count${selected.length === 1 ? 'y' : 'ies'} selected`}
          <span className="float-right text-gray-400">▾</span>
        </button>
        {open && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-auto">
            <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search counties…"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-indigo-300"
              />
            </div>
            {filtered.map(c => (
              <label
                key={`${id}-${c}`}
                className="flex items-center gap-3 px-3 py-2 text-base hover:bg-indigo-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(c)}
                  onChange={() => toggle(c)}
                  className="accent-indigo-600 w-3.5 h-3.5"
                />
                {c}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="space-y-8">
      {/* ── Two-panel grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ─── LEFT PANEL: Dataset Selection, Intended Use, Agreement ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          {/* Dataset selection */}
          <div>
            {sectionLabel('Dataset Selection')}
            <div className="space-y-2.5">
              {DATASETS.map(d =>
                checkbox(d.label, dataset.datasets.includes(d.key), () => toggleDataset(d.key)),
              )}
            </div>
            {datasetErrors.datasets && <p className="text-red-500 text-sm mt-1">⚠ Select at least one dataset</p>}
          </div>

          {/* Intended use */}
          <div>
            {sectionLabel('Intended Use')}
            <textarea
              value={dataset.intendedUse}
              onChange={e => setDataset(prev => ({ ...prev, intendedUse: e.target.value }))}
              placeholder="Describe how you plan to use this data…"
              rows={4}
              className={`w-full border rounded-md px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none ${
                datasetErrors.intendedUse ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {datasetErrors.intendedUse && <p className="text-red-500 text-sm mt-1">⚠ Describe the intended use</p>}
          </div>

          {/* Terms */}
          <div>
            {checkbox(
              'I agree to cite dataset per recommended format',
              dataset.agreeTerms,
              () => setDataset(prev => ({ ...prev, agreeTerms: !prev.agreeTerms })),
              !!datasetErrors.agreeTerms,
            )}
            {datasetErrors.agreeTerms && <p className="text-red-500 text-sm mt-1">⚠ You must agree to the terms</p>}
          </div>
        </div>

        {/* ─── RIGHT PANEL: Geographic Scope, Data Format, Contact ──── */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          {/* Geographic scope */}
          <div>
            {sectionLabel('Geographic Scope')}
            <div className="space-y-2.5">
              {radioBtn('geoScope', 'All Kansas Counties', dataset.geoScope === 'all', () =>
                setDataset(prev => ({ ...prev, geoScope: 'all', specificCounties: [], regionType: '' })),
              )}
              {radioBtn('geoScope', 'Specific Counties', dataset.geoScope === 'specific', () =>
                setDataset(prev => ({ ...prev, geoScope: 'specific', regionType: '' })),
              )}
            </div>

            {dataset.geoScope === 'specific' && (
              <div className="mt-2">
                <CountyMultiSelect selected={dataset.specificCounties} toggle={toggleDatasetCounty} id="dataset" />
                {datasetErrors.specificCounties && <p className="text-red-500 text-sm mt-1">⚠ Select at least one county</p>}
              </div>
            )}

            {dataset.geoScope === 'region' && (
              <div className="mt-2 flex gap-4">
                {radioBtn('regionType', 'Metro', dataset.regionType === 'Metro', () =>
                  setDataset(prev => ({ ...prev, regionType: 'Metro' })),
                )}
                {radioBtn('regionType', 'Rural', dataset.regionType === 'Rural', () =>
                  setDataset(prev => ({ ...prev, regionType: 'Rural' })),
                )}
                {datasetErrors.regionType && <p className="text-red-500 text-sm mt-1">⚠ Select a region type</p>}
              </div>
            )}
          </div>

          {/* Data format */}
          <div>
            {sectionLabel('Data Format')}
            <div className="flex gap-6">
              {['CSV', 'Excel', 'JSON'].map(f =>
                radioBtn('dataFormat', f, dataset.dataFormat === f, () =>
                  setDataset(prev => ({ ...prev, dataFormat: f })),
                ),
              )}
            </div>
          </div>

          {/* Contact info */}
          <div>
            {sectionLabel('Contact Information')}
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Name *"
                  value={dataset.name}
                  onChange={e => setDataset(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full border rounded-md px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                    datasetErrors.name ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {datasetErrors.name && <p className="text-red-500 text-sm mt-1">⚠ Name is required</p>}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email *"
                  value={dataset.email}
                  onChange={e => setDataset(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full border rounded-md px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                    datasetErrors.email ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {datasetErrors.email && <p className="text-red-500 text-sm mt-1">⚠ {dataset.email.trim() ? 'Enter a valid email address' : 'Email is required'}</p>}
              </div>
              <input
                type="text"
                placeholder="Organization (optional)"
                value={dataset.organization}
                onChange={e => setDataset(prev => ({ ...prev, organization: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit button (centered) ───────────────────────── */}
      <div className="flex flex-col items-center gap-3">
        {/* Consolidated error banner */}
        {Object.keys(datasetErrors).length > 0 && (
          <div className="w-full max-w-xl bg-red-50 border border-red-300 rounded-lg px-5 py-4 text-sm">
            <p className="font-semibold text-red-700 mb-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold shrink-0">!</span>
              Please complete the following required fields:
            </p>
            <ul className="list-disc list-inside text-red-600 space-y-0.5 pl-1">
              {Object.values(datasetErrors).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmitDataset}
          disabled={submitting}
          className={`px-16 rounded-lg py-3 text-base font-semibold transition ${
            submitting
              ? 'bg-indigo-400 text-white cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>

        {submitError && (
          <div className="w-full max-w-xl bg-red-50 border border-red-300 text-red-700 rounded-lg px-5 py-3 text-sm flex items-center gap-2">
            <span className="text-red-600 text-lg">✕</span>
            {submitError}
          </div>
        )}

        {datasetSuccess && (
          <div className="w-full max-w-xl bg-green-50 border border-green-200 text-green-700 rounded-lg px-5 py-4 text-sm">
            <p className="flex items-center gap-2 font-semibold mb-1">
              <span className="text-green-600 text-lg">✓</span>
              Request submitted successfully!
            </p>
            <p>{successMessage || `A download link has been sent to ${dataset.email}. Please check your inbox (and spam folder).`}</p>
          </div>
        )}
      </div>

      {/* ── Citation & Resources (centered below) ──────────── */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 space-y-5">
        <h3 className="text-lg font-bold text-gray-900">Citation &amp; Resources</h3>

        {/* Citation block */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3">
          <code className="flex-1 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {CITATION_TEXT}
          </code>
          <button
            type="button"
            onClick={copyCitation}
            className="shrink-0 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            {citationCopied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {/* Resource links */}
        <div className="flex flex-wrap justify-between text-base">
          <a
            href="/docs/methodology.pdf"
            className="text-indigo-600 hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 Methodology Documentation
          </a>
          <a
            href="https://github.com/csrisurya/The-Kansas-Data-Science-Education-Atlas"
            className="text-indigo-600 hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 GitHub Repository
          </a>
        </div>
      </div>
    </div>
  );
};

export default DataRequestPage;
