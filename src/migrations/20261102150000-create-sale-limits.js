'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('SaleLimits', {
      id: {type:S.INTEGER, primaryKey:true, autoIncrement:true, allowNull:false},
      game_id: {type:S.INTEGER, allowNull:false, references:{model:'Games',key:'id'}},
      user_id: {type:S.INTEGER, allowNull:false, references:{model:'Users',key:'id'}},
      configuration: {type:S.JSON, allowNull:false},
      createdAt: {type:S.DATE, allowNull:false}, updatedAt: {type:S.DATE, allowNull:false}
    });
    await q.addIndex('SaleLimits', ['game_id','user_id'], {unique:true});
  },
  async down(q) { await q.dropTable('SaleLimits'); }
};
