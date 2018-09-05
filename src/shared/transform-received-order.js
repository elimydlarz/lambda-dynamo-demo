const populateId = input => ({
  id: input.id,
});

const populateProducts = input => ({
  products: input.data,
});

const transformers = [populateId, populateProducts];

export default input => transformers
  .reduce((output, transform) => ({ ...output, ...transform(input) }), {});
