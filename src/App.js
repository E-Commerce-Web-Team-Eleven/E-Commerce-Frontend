import React, { useEffect, useState, useRef, useCallback } from "react";
import axios, { AxiosError } from "axios";
import "./App.css";
import loadingImage from "./loading.gif";
import foodImage from "./food.png";

function App() {
  const [text, setText] = useState("");
  const onChangeKeyword = (e) => {
    setText(e.target.value);
  };
  const [recipe, setRecipe] = useState([]);

  const [introductions, setIntroductions] = useState([]);

  const [recipeIntro, setRecipeIntro] = useState({});

  const [ingredients, setIngredients] = useState([]);

  const [fileName, setFileName] = useState("첨부파일");

  const [clickFlag, setClickFlag] = useState(false);

  const [loadingFlag, setLoadingFlag] = useState(false);

  const [errFlag, setErrFlag] = useState(false);

  const IngredientSearchById = async (id) => {
    try {
      const params = { RECIPE_ID: id };

      const response = await axios.get("http://localhost:8080/ingredient", {
        params,
      });
      setIngredients(response.data.result.row);
    } catch (err) {
      console.log(err);
    }
  };

  const foodSearchByName = async (name) => {
    try {
      const params = { IRDNT_NM: name };

      const response = await axios.get("http://localhost:8080/foodIdList", {
        params,
      });

      console.log("response.data", response.data.result.row);

      if (response.data.result.row.length !== 0) {
        response.data.result.row.some((item) => {
          if (item.IRDNT_TY_NM === "주재료") {
            console.log("this is ", item);

            foodIntroSearchById(item.RECIPE_ID);
            IngredientSearchById(item.RECIPE_ID);
            recipeSearchById(item.RECIPE_ID);
            return true;
          }
        });
      } else {
        setLoadingFlag(false);
        setErrFlag(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const recipeSearchById = async (id) => {
    try {
      const params = { RECIPE_ID: id };

      const response = await axios.get("http://localhost:8080/recipe", {
        params,
      });
      console.log("recipe is ", response.data);
      setRecipe(response.data.result.row);
    } catch (err) {
      console.log(err);
    }
  };

  const getAllIntroductions = async () => {
    try {
      const response = await axios.get("http://localhost:8080/allIntro");
      setIntroductions(response.data.result.row);
    } catch (err) {
      console.log(err);
    }
  };
  const foodIntroSearchById = async (id) => {
    try {
      console.log("foodIntroSearchById", introductions);
      const response = await axios.get("http://localhost:8080/allIntro");
      response.data.result.row.some((item) => {
        //introductions.some((item) => {
        console.log("food", item);
        if (item.RECIPE_ID === id) {
          console.log(item);
          setRecipeIntro(item);
          setLoadingFlag(false);
          return true;
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const searchRecipeByKeyword = () => {
    setClickFlag(true);
    setLoadingFlag(true);
    setErrFlag(false);
    if (text !== "") foodSearchByName(text);
  };

  const searchRecipeByImage = (name) => {
    foodSearchByName(name);
  };

  const onUploadImage = async (e) => {
    if (e.target.files.length == 0) {
      return;
    } else {
      setErrFlag(false);
      setLoadingFlag(true);
      setClickFlag(true);
      setFileName(e.target.files[0].name);
      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      await axios({
        url: "http://localhost:8080/food",
        method: "POST",
        data: formData,
      })
        .then((response) => {
          console.log(
            "res",
            response.data.foodName.substring(
              0,
              response.data.foodName.length - 2
            )
          );
          if (response.data.foodName.includes("potato")) {
            searchRecipeByImage("감자");
          } else if (response.data.foodName.includes("kimchi")) {
            searchRecipeByImage("김치");
          } else if (response.data.foodName.includes("green_onion")) {
            searchRecipeByImage("대파");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  useEffect(() => {
    getAllIntroductions();
    console.log("clickFlag", clickFlag);
  }, []);

  return (
    <div id="outer">
      <div id="inner">
        <div id="search">
          <span class="file">
            <input class="upload-name" value={fileName} />
            <label for="file">첨부파일</label>
            <input
              type="file"
              accept="image/*"
              onChange={onUploadImage}
              id="file"
            />
          </span>
          <span>
            <input
              placeholder="ex)토마토"
              onChange={onChangeKeyword}
              value={text}
              class="search"
            />
            <button class="search" onClick={() => searchRecipeByKeyword()}>
              레시피 검색
            </button>
          </span>
        </div>
        {clickFlag && !loadingFlag && !errFlag && (
          <div>
            <div id="introduction">
              <div id="recommendation">추천 레시피</div>
              <div id="foodName">" {recipeIntro.RECIPE_NM_KO} "</div>

              <div id="foodIntro">{recipeIntro.SUMRY}</div>
              <div class="foodInfos">
                <div>
                  <span class="foodInfo">칼로리 : {recipeIntro.CALORIE}</span>

                  <span class="foodInfo">
                    조리시간 : {recipeIntro.COOKING_TIME}
                  </span>
                </div>
                <div>
                  <span class="foodInfo">
                    종류 : {recipeIntro.NATION_NM}({recipeIntro.TY_NM})
                  </span>
                  <span class="foodInfo">분량 : {recipeIntro.QNT}</span>
                </div>
              </div>
            </div>
            <div id="ingredient">
              <div>
                <span id="mainIrdntTitle">주재료</span>
                {ingredients.map((item) => {
                  if (item.IRDNT_TY_NM === "주재료") {
                    return (
                      <span key={item.IRDNT_NM} class="mainIngredient">
                        {item.IRDNT_NM + " " + item.IRDNT_CPCTY + ", "}
                      </span>
                    );
                  }
                })}
              </div>
              <div>
                <span id="subIrdntTitle">부재료</span>
                {ingredients.map((item) => {
                  if (item.IRDNT_TY_NM === "부재료") {
                    return (
                      <span key={item.IRDNT_NM} class="subIngredient">
                        {item.IRDNT_NM + " " + item.IRDNT_CPCTY + ", "}
                      </span>
                    );
                  }
                })}
              </div>
              <div>
                <span id="seasoningIrdntTitle">양념</span>
                {ingredients.map((item) => {
                  if (item.IRDNT_TY_NM === "양념") {
                    return (
                      <span key={item.IRDNT_NM} class="seasoningIngredient">
                        {item.IRDNT_NM + " " + item.IRDNT_CPCTY + ", "}
                      </span>
                    );
                  }
                })}
              </div>
            </div>
            <div id="recipe">
              {recipe.map((item) => {
                if (item.STEP_TIP === "") {
                  return (
                    <div key={item.COOKING_NO}>
                      <div class="cookingStep">
                        {item.COOKING_NO + ". " + item.COOKING_DC}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={item.COOKING_NO}>
                      <div class="cookingStep">
                        {item.COOKING_NO + ". " + item.COOKING_DC}
                      </div>
                      <div class="cookingTip">TIP : {item.STEP_TIP}</div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}
        {!clickFlag && (
          <div>
            <img src={foodImage} width="300" height="300" />
            <div id="notice">
              식재료 사진을 업로드하거나 식재료 키워드를 검색해보세요!
            </div>
          </div>
        )}
        {loadingFlag && clickFlag && (
          <div>
            <img src={loadingImage} />
            <div id="notice">로딩 중...</div>
          </div>
        )}
        {errFlag && (
          <div>
            <img src={foodImage} width="300" height="300" />
            <div id="notice">
              검색 결과가 없습니다. 다른 키워드로 검색해보세요!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
