"use client";

type MetadataEditorProps = {
  value: string;
  onChange: (text: string) => void;
};

export default function MetadataEditor({
  value,
  onChange,
}: MetadataEditorProps) {
  return (
    <div>
      <h2 className="font-semibold mb-2">
        Table / Column Notes
      </h2>

      <textarea
        className="w-full h-32 p-2 border rounded text-black"
        placeholder="Add business context, table meanings, joins, caveats, etc."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {value && (
        <p className="text-xs mt-1">
          Notes added ✓
        </p>
      )}
    </div>
  );
}
