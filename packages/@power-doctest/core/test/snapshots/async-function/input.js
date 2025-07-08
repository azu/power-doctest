async function doAsync() {
	return "値";
}
// doAsync関数はPromiseを返す
doAsync().then((value) => {
	console.log(value); // => "値"
});
