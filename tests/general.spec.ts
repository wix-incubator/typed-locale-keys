import { defaultSpy, generateResult } from './helpers';

test('nested data', async () => {
  const namespace = 'nested';

  const { localeKeys } = await generateResult<{
    common: {
      create(): string;
    };
    model: { user: { id(): string } };
  }>(namespace);

  const result = localeKeys(defaultSpy());

  expect(result.common.create()).toBe(`transformed -> common.create`);
  expect(result.model.user.id()).toBe(`transformed -> model.user.id`);
});

test('flat data', async () => {
  const namespace = 'flat';

  const { localeKeys } = await generateResult<{
    common: {
      cancel(): string;
    };
    model: {
      player: {
        name(): string;
      };
    };
  }>(namespace);

  const result = localeKeys(defaultSpy());

  expect(result.common.cancel()).toBe(`transformed -> common.cancel`);
  expect(result.model.player.name()).toBe(`transformed -> model.player.name`);
});

test('data interpolation double quote', async () => {
  const namespace = 'interpolation-double';

  const { localeKeys } = await generateResult<{
    common: {
      greeting(params: { name: unknown }): string;
      invitation(params: { first: unknown; second: unknown }): string;
    };
  }>(namespace);

  const spy = jest
    .fn()
    .mockImplementationOnce(
      (key, { name }) => `transformed -> ${key}; name: ${name} !!!`
    );

  const result = localeKeys(spy);

  expect(result.common.greeting({ name: 'John' })).toBe(
    `transformed -> common.greeting; name: John !!!`
  );

  spy.mockImplementationOnce(
    (key, { first, second }) =>
      `transformed -> ${key}; first: ${first}; second: ${second} !`
  );

  expect(result.common.invitation({ first: 'One', second: 'Two' })).toBe(
    `transformed -> common.invitation; first: One; second: Two !`
  );
});

test('data interpolation single quote', async () => {
  const namespace = 'interpolation-single';

  const { localeKeys } = await generateResult<{
    common: {
      loggedIn: {
        message(data: { username: unknown }): string;
      };
    };
    readingWarning(data: { reader: unknown; writer: string }): string;
  }>(namespace, {
    interpolationSuffix: '}',
    interpolationPrefix: '{'
  });

  const spy = jest
    .fn()
    .mockImplementationOnce(
      (key, { username }) => `transformed -> ${key}; username: ${username} !!!`
    );

  const result = localeKeys(spy);

  expect(result.common.loggedIn.message({ username: 'Boss' })).toBe(
    `transformed -> common.loggedIn.message; username: Boss !!!`
  );

  spy.mockImplementationOnce(
    (key, { reader, writer }) =>
      `transformed -> ${key}; reader: ${reader}; writer: ${writer} !!`
  );

  expect(result.readingWarning({ reader: 'Alice', writer: 'Bob' })).toBe(
    `transformed -> readingWarning; reader: Alice; writer: Bob !!`
  );
});
