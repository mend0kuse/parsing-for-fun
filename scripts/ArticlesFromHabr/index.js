import puppeteer from 'puppeteer';
import fs from 'fs';

async function main() {
	const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
	
	await page.setViewport({ height:1080, width:1920})

	async function fillResult (){
		const asd = []
		for (let i = 1; i < 51; i++) {
			await page.goto(`https://habr.com/ru/all/page${i}/`,{ waitUntil: 'domcontentloaded' });
			const articles = await page.evaluate(()=> {
				return Array.from(document.querySelectorAll('article'), (el) => {
					return {
						title: el.querySelector('.tm-title')?.textContent,
						views: el.querySelector('.tm-icon-counter__value')?.textContent,
					}
				})
			})
			asd.push(...articles)
		}
		return asd 
	} 

	const	result = await fillResult()

	const tmp = result
		.map((i)=> {
			if (i.views.includes('K')) {
				const arr = i.views.split('K')
				const num = arr[0]
				let newViews;
				if(num.includes('.')){
					const tmp = num.split('.').map(i=>Number(i))
					newViews = (tmp[0] * 1000) + (tmp[1] * 100)
				}else{
					newViews = Number(num) * 1000 
				}
				return { title: i.title , views: newViews}
			} 
				
			return {...i,views: Number(i.views)}
		})
		.sort((a, b) => b.views - a.views)
	
	const data = {tmp}
	
	fs.writeFile ("scripts/ArticlesFromHabr/result.json", JSON.stringify(data.tmp, null, 4) , function(err) {
		if (err) throw err;
		console.log('complete');
	});

  await browser.close();
}

main()
