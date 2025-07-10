import { useRef } from "react";

export default ({
  error,
  setError,
  date,
  setDate,
  month,
  setMonth,
  year,
  setYear,
}: {
  error: boolean;
  setError: React.Dispatch<React.SetStateAction<boolean>>;
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  month: string;
  setMonth: React.Dispatch<React.SetStateAction<string>>;
  year: string;
  setYear: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const dateRef = useRef<HTMLInputElement | null>(null);
  const monthRef = useRef<HTMLInputElement | null>(null);
  const yearRef = useRef<HTMLInputElement | null>(null);

  const isLeapYear = (yy: string) => {
    const yr = 2000 + parseInt(yy, 10);
    return (yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0;
  };

  const checkValidDate = (d: string, m: string, y: string) => {
    if (d.length !== 2 || m.length !== 2 || y.length !== 2) return;
    const day = parseInt(d, 10);
    const mon = parseInt(m, 10);

    if (mon < 1 || mon > 12) return setError(true);

    const daysInMonth = [
      31,
      isLeapYear(y) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
    if (day < 1 || day > daysInMonth[mon - 1]) return setError(true);

    setError(false);
  };

  return (
    <p
      className={`${
        error ? "text-red-600" : "text-text-primary"
      } relative -left-2`}
    >
      <span>
        <input
          placeholder="DD"
          size={2}
          maxLength={2}
          className="text-center outline-none"
          inputMode="numeric"
          ref={dateRef}
          value={date}
          onKeyDown={(e) => {
            console.log(e.key);
            if (e.key == "Backspace") {
              setDate((prev) => prev.slice(0, prev.length - 1));
              e.preventDefault();
            } else if (e.key == " ") {
              if (date.length == 1) {
                setDate((prev) => 0 + prev);
                monthRef.current?.focus();
              }
              e.preventDefault();
            } else if (!Number.isInteger(parseInt(e.key))) e.preventDefault();
            else {
              if (date.length == 2) {
                setDate("");
              }
            }
          }}
          onChange={(e) => {
            const newDate = e.target.value;
            setDate(newDate);
            if (e.target.value.length == 2) {
              checkValidDate(newDate, month, year);
              monthRef.current?.focus();
            }
          }}
        />
      </span>
      <span>/</span>
      <span>
        <input
          placeholder="MM"
          size={2}
          className="text-center outline-none"
          inputMode="numeric"
          ref={monthRef}
          value={month}
          onKeyDown={(e) => {
            if (e.key == "Backspace") {
              if (month.length == 0) dateRef.current?.focus();
              else {
                setMonth((prev) => prev.slice(0, prev.length - 1));
                e.preventDefault();
              }
            } else if (e.key == " ") {
              if (month.length == 1) {
                setMonth((prev) => 0 + prev);
                yearRef.current?.focus();
              }
              e.preventDefault();
            } else if (!Number.isInteger(parseInt(e.key))) e.preventDefault();
            else {
              if (month.length == 2) {
                setMonth("");
              }
            }
          }}
          onFocus={() => {
            if (date == "") {
              dateRef.current?.focus();
            }
          }}
          onChange={(e) => {
            const newMonth = e.target.value;
            setMonth(newMonth);
            if (e.target.value.length == 2) {
              checkValidDate(date, newMonth, year);
              yearRef.current?.focus();
            }
          }}
        />
      </span>
      <span>/</span>
      <span>
        <input
          placeholder="YY"
          size={2}
          className="text-center outline-none"
          inputMode="numeric"
          ref={yearRef}
          value={year}
          onFocus={() => {
            if (month == "") {
              monthRef.current?.focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key == "Backspace") {
              if (year.length == 0) monthRef.current?.focus();
              else {
                setYear((prev) => prev.slice(0, prev.length - 1));
                e.preventDefault();
              }
            } else if (!Number.isInteger(parseInt(e.key))) e.preventDefault();
            else {
              if (year.length == 2) {
                setYear("");
              }
            }
          }}
          onChange={(e) => {
            const newYear = e.target.value;
            setYear(newYear);
            if (e.target.value.length == 2) {
              checkValidDate(date, month, newYear);
              e.target.blur();
            }
          }}
        />
      </span>
    </p>
  );
};
