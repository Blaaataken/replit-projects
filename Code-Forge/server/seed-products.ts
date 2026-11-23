import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating RepoGen AI products in Stripe...');

  const existingProducts = await stripe.products.search({ query: "name:'RepoGen'" });
  if (existingProducts.data.length > 0) {
    console.log('Products already exist, skipping creation');
    return;
  }

  const payPerBuildProduct = await stripe.products.create({
    name: 'RepoGen Pay-Per-Build',
    description: 'Generate one complete repository with AI',
    metadata: { type: 'one_time' },
  });

  await stripe.prices.create({
    product: payPerBuildProduct.id,
    unit_amount: 300,
    currency: 'usd',
    metadata: { type: 'pay_per_build' },
  });

  console.log('Created Pay-Per-Build product:', payPerBuildProduct.id);

  const subscriptionProduct = await stripe.products.create({
    name: 'RepoGen Pro Monthly',
    description: 'Unlimited repository generations per month',
    metadata: { type: 'subscription' },
  });

  await stripe.prices.create({
    product: subscriptionProduct.id,
    unit_amount: 1500,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { type: 'subscription_monthly' },
  });

  console.log('Created Subscription product:', subscriptionProduct.id);
  console.log('Products created successfully!');
}

createProducts().catch(console.error);
