import { Card, PageTitle } from '../components/ui.js';

export function Component() {
  return (
    <div>
      <PageTitle title="Vorteile" />
      <Card style={{ marginTop: 24, padding: 24 }}>
        <p style={{ fontSize: 13, color: '#55544f', margin: 0 }}>
          Die Verwaltung eigener Vorteile folgt in einem separaten Update.
        </p>
      </Card>
    </div>
  );
}
