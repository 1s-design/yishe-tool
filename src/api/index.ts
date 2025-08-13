import { apiInstance, source } from "./apiInstance";
import { deleteCOSFile, downloadCOSFile, uploadToCOS } from "./cos";
import { Url } from "./url";
export { uploadToCOS, deleteCOSFile, downloadCOSFile } from './cos'

interface FetchFileOptions {
  filename: string  // 请求的文件名
}


function getFileSuffixFromContentType(contentType) {

  let extension = null

  switch (contentType) {
    case 'image/jpeg':
      extension = 'jpg';
      break;
    case 'image/png':
      extension = 'png';
      break;
    case 'image/svg+xml':
      extension = 'svg';
      break;
    case 'application/pdf':
      extension = 'pdf';
      break;
    case 'text/plain':
      extension = 'txt';
      break;
    // 添加更多类型...
    default:
      console.log('未知的文件类型');
  }

  return extension
}

/**
 * @description 根据一个地址 请求文件
*/
export async function fetchFile(url, options) {

  const response = await fetch(url, options)

  const contentType = response.headers.get('Content-Type');

  let suffix = getFileSuffixFromContentType(contentType)

  var { filename }: any = {
    ...{
      filename: String(new Date().getTime()) + '.' + suffix
    },
    ...options
  }

  if (!response.ok) {

    throw new Error("file request failed");
  }

  const blob = await response.blob();

  const file = new File([blob], filename, {
    type: blob.type,
    lastModified: Date.now()
  });


  return file;
}

// 注册 ，账号密码手机号
export const register = (data: any) => apiInstance.post(Url.SINGUP, data);

// 登录
export const login = (data) =>
  new Promise(async (resolve, reject) => {
    try {
      let res = await apiInstance.post(Url.LOGIN, data);
      resolve(res.data);
    } catch (e) {
      reject()
    }
  });

//  更新用户信息

const updateUserInfo = (data) => apiInstance.post(Url.UPDATE_USER_INFO, data)

const getUserInfo = async (data) => {
  const res = await apiInstance.post('/api/user/getUserInfo', data)

  return res.data.data
}



// 根据图片id来查询图片
export const logout = () => new Promise(async (resolve, reject) => {
  const data = await apiInstance.post('/api/user/logout')
  resolve(null)
})




// 获取首页展示栏模型
export const getBannerModel = () =>
  new Promise(async (resolve, reject) => {
    const res = await apiInstance.get(Url.GET_BANNER_MODEL);
    resolve(res?.data?.data?.modelInfo);
  });

// 获取可以进行编辑的内置模型
export const getBaseModel = (params?: any) =>
  new Promise(async (resolve, reject) => {
    const res = await apiInstance.post(Url.GET_BASE_MODEL, params);
    resolve(
      res.data.data
    );
  });

// 获取基本盒子天空模型
export const getBaseSkybox = () => apiInstance.get("getBaseSkybox");

// 获取网络热门贴图
export const getWebStickers = () => apiInstance.post("getWebStickers");

// 获取我的贴图
export const getMyStickers = () => apiInstance.post("getMyStickers");

// 上传基础模型
export const uploadBaseModel = (data: any) =>
  apiInstance.post(Url.UPLOAD_BASE_MODEL, data);

// 上传图片
export const uploadImage = (data: any) =>
  apiInstance.post(Url.UPLOAD_IMAGE, data);

// 获取图片列表
export const getImage = (params) =>
  new Promise(async (resolve: any, reject: any) => {
    let res = await apiInstance.post(Url.GET_IMAGE_LIST, params);
    resolve(res.data.data);
  });

// 获取所有字体

export const getFonts = () =>
  new Promise(async (resolve, reject) => {
    const res = await apiInstance.get(Url.GET_FONTS);
    resolve(res.data.data);
  });


// 获取模型列表
export const getModelList = (data) =>
  new Promise(async (resolve, reject) => {
    const res = await apiInstance.post(Url.GET_MODEL_LIST, data);
    resolve(res.data.data);
  });

export const getModelById = (id) =>
  new Promise(async (resolve, reject) => {
    const res = await apiInstance.post(Url.GET_MODEL_BY_ID, { id });
    resolve(res.data.data);
  });

// 发送邮件
export const sendEmail = (data) => apiInstance.post(Url.SEND_MAIL, data);




export const getUserList = (params?: any) =>
  new Promise(async (resolve, reject) => {
    const res = await apiInstance.post('/api/user/page', params);
    resolve(res.data.data);
  });



// 上传文字贴纸
export const uploadTextSticker = (params) => new Promise(async (resolve) => {
  const res = await apiInstance.post(Url.CREATE_TEXT_STICKER, params)
  resolve(res.data.data);
})


// 获取文字贴纸
export const getTextSticker = (params?: any) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.GET_TEXT_STICKER, params)
  resolve(res.data.data)
})


// 获取账号的状态，，是否注册，是否已注册，是否是管理员，是否被禁用等
export const getAccountStatus = (params) => new Promise(async (resolve, reject) => {
  const data = await apiInstance.post(Url.GET_ACCOUNT_STATUS, params)
  resolve(data.data)
})

// 根据图片id来查询图片
export const getImageById = (id: string) => new Promise(async (resolve, reject) => {
  const data = await apiInstance.post(Url.GET_IMAGE_BY_ID, { id })
  resolve(data.data.data)
})


export const getFontById = (id: string) => new Promise(async (resolve, reject) => {
  const data = await apiInstance.post(Url.GET_FONT_BY_ID, { id })
  resolve(data.data.data)
})



export const getBasicConfig = () => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.GET_BASIC_CONFIG)
  resolve(res.data.data)
})


/*
  该接口作为获取列表资源的通用接口
*/

export interface GetListParams {
  type: 'image' | 'textSticker' | 'model',
  page: number
}


export const getList = (params: GetListParams) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.GET_LIST, params)
  resolve(res.data)
})




/*
  点赞模型，
  取消点赞模型
*/

export const likeModel = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.LIKE_MODEL, params)
  resolve(res.data)
})



export const likeModelComment = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.LIKE_MODEl_COMMENT, params)
  resolve(res.data)
})

/*
  获取用于扫码登录的二维码
*/
export const requestQRCodeLoginInfo = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.GET_QRCODE_LOGIN_URL, params)
  resolve(res.data)
})


/*
  发布模型
*/

export const publishModel = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.PUBLISH_MODEL, params)
  resolve(res.data)
})



export const likeAvailableModel = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.LIKE_AVAILABLE_MODEL, params)
  resolve(res.data)
})


export const likeAvailableModelComment = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.LIKE_AVAILABLE_MODEl_COMMENT, params)
  resolve(res.data)
})


export const getAvailableModel = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.GET_AVAILABLE_MODEL, params)
  resolve(res.data.data)
})

export const getIndexAvailableModel = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.GET_INDEX_AVAILABLE_MODEL, params)
  resolve(res.data.data)
})

export const follow = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.FOLLOW, params)
  resolve(res.data.data)
})


export const unfollow = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.UNFOLLOW, params)
  resolve(res.data.data)
})

// 获取我的关注列表
export const getMyFollowings = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.GET_MY_FOLLOWINGS, params)
  resolve(res.data.data)
})

// 获取我的关注列表
export const getMyFollowers = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.GET_MY_FOLLOWERS, params)
  resolve(res.data.data)
})

// 获取我的好友列表
export const getMyFriends = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.GET_MY_FRIENDS, params)
  resolve(res.data.data)
})


// 获取我的聊天列表
export const getMyCommunicationList = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.GET_MY_COMMUNICATION_LIST, params)
  resolve(res.data.data)
})




// 获取聊天信息
export const getCommunicationMessage = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post(Url.GET_COMMUNICATION_MESSAGE, params)
  resolve(res.data.data)
})


/*
    通用的上传文件接口,
    先上传到cos，再存储路径到服务器
*/
export const uploadManyFile = (params) => new Promise(async (resolve, reject) => {
  await Promise.all(params.map(uploadFile))
  resolve(undefined)
})



export const uploadFile = (params) => new Promise(async (resolve, reject) => {

  const data = {
    ...params,
    thumbnail: params.thumbnail,
    name: params.name,
    type: params.type,
    size: params.size,
    meta: params.meta || {},
  }

  await apiInstance.post('/api/file/create', data)
  resolve(void 0)
})

export const uploadFont = (params) => new Promise(async (resolve, reject) => {

  const data = {
    ...params,
    thumbnail: params.thumbnail,
    name: params.name,
    type: params.type,
    size: params.size,
    meta: params.meta || {},
  }

  await apiInstance.post('/api/font-template/create', data)
  resolve(void 0)
})




export const getFontList = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post('/api/font-template/page', params)
  resolve(res.data.data)
})


export const updateFontTemplate = (params) => new Promise(async (resolve, reject) => {

  const data = {
    ...params,
    thumbnail: params.thumbnail,
    name: params.name,
    size: params.size,
    meta: params.meta || {},
  }

  let res =  await apiInstance.post('/api/font-template/update', data)
  resolve(res)
})

export const deleteFontTemplate = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/font-template/delete', data)
  resolve(res.data.data)
})

/* 
  获取商品模型列表
*/
export const getProductModelList = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/product-model/page', data)
  resolve(res.data.data)
})


export const createProductModel = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('api/product-model/create', data)
  resolve(res.data.data)
})

export const updateProductModel = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('api/product-model/update', data)
  resolve(res.data.data)
})

export const deleteProductModel = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/product-model/delete', data)
  resolve(res.data.data)
})

/*
    获取所有贴纸
*/
export const getStickerList = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/sticker/page', data)
  resolve(res.data.data)
})

// 获取自定义贴纸列表
export const getCustomStickerList = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/sticker/page', { ...data, isCustom: true })
  resolve(res.data.data)
})


export const deleteSticker = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/sticker/delete', data)
  resolve(res.data.data)
})


/*
 创建贴纸
*/
export const createSticker = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/sticker/create', data)
  resolve(res.data.data)
})

export const updateSticker = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/sticker/update', data)
  resolve(res.data.data)
})



/**
 * 获取文件列表
*/
export const getFileList = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post('/api/file/page', params)
  resolve(res.data.data)
})

export const updateFile = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/file/update', data)
  resolve(res.data.data)
})



/* 获取字体列表 */
export const getFontListApi = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post('/api/file/page', {
    ...params,
    type: 'ttf,woff,otf'
  })
  resolve(res.data.data)
})


export const deleteFile = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/file/delete', {
    id: data
  })
  resolve(res.data.data)
})



/*
 上传自定义的模型
*/
export const createCustomModelApi = (data) => new Promise(async (resolve, reject) => {
  const res = await  apiInstance.post(Url.UPLOAD_CUSTOM_MODEL, data);
  resolve(res.data.data)
})




export const getCustomModelList = (params) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post('/api/custom-model/page', params)
  resolve(res.data.data)
})


// 根据图片id来查询图片
export const getCustomModelById = (id: string) => new Promise(async (resolve, reject) => {
  const res = await apiInstance.post('/api/custom-model', {id})
  resolve(res.data.data)
})

export const deleteCustomModel = (ids: string | string[]) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/custom-model/delete', {
    ids: ids
  })
  resolve(res.data.data)
})


export const updateCustomModel = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('api/custom-model/update', data)
  resolve(res.data.data)
})



// 根据图片id来查询图片
export const getProductModelById = (id: string) => new Promise(async (resolve, reject) => {
  const data = await apiInstance.get(`/api/product-model/${id}`)
  resolve(data.data.data)
})

export const getStickerById = (id: string) => new Promise(async (resolve, reject) => {
  const data = await apiInstance.get('/api/sticker', { params: { id } })
  resolve(data.data.data)
})

export const getDraftById = (id: string) => new Promise(async (resolve, reject) => {
  const data = await apiInstance.get('/api/draft', { params: { id } })
  resolve(data.data.data)
})




/**
 * @define 公司管理
*/
export const getCompanyList = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/company/page', data)
  resolve(res.data.data)
})


export const createCompany = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/company/create', data)
  resolve(res.data.data)
})


export const deleteCompany = (data) => apiInstance.post('/api/company/delete', data)

export const updateCompany = (data) => apiInstance.post('/api/company/update', data)

/**
 * @define 服装资源管理
*/
export const getResourceList = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/resource/page', data)
  resolve(res.data.data)
})


export const createResource = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/resource/create', data)
  resolve(res.data.data)
})


export const deleteResource = (data) => apiInstance.post('/api/resource/delete', data)

export const updateResource = (data) => apiInstance.post('/api/resource/update', data)


export const hello = (data) => apiInstance.get('/api/hello')


/*
    文件草稿
*/


export const createDraft = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/draft/create', data)
  resolve(res.data.data)
})


export const getDraftList = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/draft/page', data)
  resolve(res.data.data)
})


export const deleteDraft = (data) => new Promise(async (resolve, reject) => {
  let res = await apiInstance.post('/api/draft/delete', data)
  resolve(res.data.data)
})



// 句子相关API
export const getSentenceList = (data?: any) => new Promise(async (resolve, reject) => {
  try {
    const res = await apiInstance.post('/api/sentences/page',  data );
    resolve(res.data.data || res.data);
  } catch (error) {
    reject(error);
  }
});

export const createSentence = (data) => new Promise(async (resolve, reject) => {
  try {
    const res = await apiInstance.post('/api/sentences', data);
    resolve(res.data.data || res.data);
  } catch (error) {
    reject(error);
  }
});

export const updateSentence = (id, data) => new Promise(async (resolve, reject) => {
  try {
    const res = await apiInstance.patch(`/api/sentences/${id}`, data);
    resolve(res.data.data || res.data);
  } catch (error) {
    reject(error);
  }
});

export const deleteSentence = (id) => new Promise(async (resolve, reject) => {
  try {
    const res = await apiInstance.delete(`/api/sentences/${id}`);
    resolve(res.data.data || res.data);
  } catch (error) {
    reject(error);
  }
});

export const getSentenceById = (id) => new Promise(async (resolve, reject) => {
  try {
    const res = await apiInstance.get(`/api/sentences/${id}`);
    resolve(res.data.data || res.data);
  } catch (error) {
    reject(error);
  }
});

// 爬虫素材相关API
export const createCrawlerMaterial = (data) => new Promise(async (resolve, reject) => {
  try {
    const res = await apiInstance.post('/api/crawler/material/add', data);
    resolve(res.data.data || res.data);
  } catch (error) {
    reject(error);
  }
});

export const getCrawlerMaterialList = (data) => new Promise(async (resolve, reject) => {
  try {
    const res = await apiInstance.post('/api/crawler/material/page', data);
    resolve(res.data.data || res.data);
  } catch (error) {
    reject(error);
  }
});

export const updateCrawlerMaterial = (data) => new Promise(async (resolve, reject) => {
  try {
    const res = await apiInstance.post('/api/crawler/material/update', data);
    resolve(res.data.data || res.data);
  } catch (error) {
    reject(error);
  }
});

export const deleteCrawlerMaterial = (data) => new Promise(async (resolve, reject) => {
  try {
    const res = await apiInstance.post('/api/crawler/material/delete', data);
    resolve(res.data.data || res.data);
  } catch (error) {
    reject(error);
  }
});

export const getCrawlerMaterialById = (id) => new Promise(async (resolve, reject) => {
  try {
    const res = await apiInstance.get(`/api/crawler/material?id=${id}`);
    resolve(res.data.data || res.data);
  } catch (error) {
    reject(error);
  }
});

class Api {

  // 测试服务是否联通
  hello = hello

  /* 用户相关 */
  logout = logout

  /*
  更新个人用户的元数据
  */
  async updateUserMeta(params) {
    const data = await apiInstance.post(Url.UPDATE_USER_META, params)
    return
  }


  async getUserMeta(params) {
    const res = await apiInstance.post(Url.GET_USER_META, params)
    return res.data.data
  }


  uploadToCOS = uploadToCOS

  deleteCOSFile = deleteCOSFile

  downloadCOSFile = downloadCOSFile

  createSticker = createSticker

  getFileList = getFileList


  /* 用户关系处理 */
  follow = follow
  unfollow = unfollow

  // 获取系统通用配置
  getBasicConfig = getBasicConfig

  getCustomModelList = getCustomModelList

  getCustomModelById = getCustomModelById

  getProductModelById = getProductModelById

  getStickerById = getStickerById

  updateUserInfo = updateUserInfo

  getUserInfo = getUserInfo

  getStickerList = getStickerList

  getCustomStickerList = getCustomStickerList

  updateSticker = updateSticker

  deleteSticker = deleteSticker

  deleteFile = deleteFile

  deleteCustomModel = deleteCustomModel

  updateFile = updateFile


  // 基础产品模型相关
  getProductModelList = getProductModelList
  createProductModel = createProductModel
  updateProductModel = updateProductModel
  deleteProductModel = deleteProductModel

  updateCustomModel = updateCustomModel

  // 获取用户列表
  getUserList = getUserList


  /**
   * @define 公司
  */
  getCompanyList = getCompanyList
  createCompany = createCompany
  deleteCompany = deleteCompany
  updateCompany = updateCompany

  /**
   * @define 资源
  */
  getResourceList = getResourceList
  createResource = createResource
  deleteResource = deleteResource
  updateResource = updateResource


  // 草稿文件
  getDraftList = getDraftList
  createDraft = createDraft
  deleteDraft = deleteDraft
  getDraftById = getDraftById

  // 字体相关

  updateFontTemplate = updateFontTemplate

  // 句子相关方法
  getSentenceList = getSentenceList
  createSentence = createSentence
  updateSentence = updateSentence
  deleteSentence = deleteSentence
  getSentenceById = getSentenceById

  // 爬虫素材相关方法
  createCrawlerMaterial = createCrawlerMaterial
  getCrawlerMaterialList = getCrawlerMaterialList
  updateCrawlerMaterial = updateCrawlerMaterial
  deleteCrawlerMaterial = deleteCrawlerMaterial
  getCrawlerMaterialById = getCrawlerMaterialById
}

export default new Api()
