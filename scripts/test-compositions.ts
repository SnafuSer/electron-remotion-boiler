import { getCompositions } from '@remotion/renderer';

(async () => {
  const result = await getCompositions('http://127.0.0.1:5050', {
    inputProps: { text: 'test' },
  });

  console.log('Compositions trouvées :', result.map((c) => c.id));
})();
