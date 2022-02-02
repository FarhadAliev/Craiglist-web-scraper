const results=$('li.result-row');

results.forEach((index,element)=>{
  const result=$(element);
  const firstImage = result.find('div .swipe-wrap div[data-index="0"] img').attr('src');
  console.log(firstImage)
});