const SUGGESTIONS = {
  en: ["Check account balance", "Last 5 transactions", "My account details", "Loan interest info"],
  hi: ["मेरा बैलेंस बताओ", "पिछले पांच लेनदेन", "मेरा खाता विवरण", "लोन ब्याज जानकारी"],
  mr: ["माझी शिल्लक सांगा", "माझे शेवटचे पाच व्यवहार", "माझे खाते तपशील", "कर्ज व्याज माहिती"],
};

export default function SuggestionChips({ language = "en", onPick }) {
  const list = SUGGESTIONS[language] || SUGGESTIONS.en;
  return (
    <div className="chips-wrap">
      {list.map((text) => (
        <button key={text} className="chip" onClick={() => onPick(text)}>
          {text}
        </button>
      ))}
    </div>
  );
}
